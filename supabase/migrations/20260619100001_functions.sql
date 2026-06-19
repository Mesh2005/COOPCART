-- ============================================================================
-- CoopCart — Business logic (RPCs). All SECURITY DEFINER + self-guarded.
-- ============================================================================

-- Resolve the per-tray price for a quantity using bulk tiers, falling back to
-- the current base price.
create or replace function resolve_unit_price(p_product_id uuid, p_qty int)
returns numeric language plpgsql stable security definer set search_path = public as $$
declare v_price numeric;
begin
  select price_per_tray into v_price
  from price_tiers
  where product_id = p_product_id
    and not is_custom_quote
    and min_qty_trays <= p_qty
    and (max_qty_trays is null or p_qty <= max_qty_trays)
  order by min_qty_trays desc
  limit 1;

  if v_price is null then
    select price_per_tray into v_price
    from product_prices
    where product_id = p_product_id
    order by effective_from desc
    limit 1;
  end if;

  return v_price;
end;
$$;

-- Place an order from the caller's cart, atomically reserving stock.
create or replace function place_order(
  p_fulfillment fulfillment_type,
  p_zone_id uuid,
  p_address text,
  p_scheduled_date date,
  p_payment_method payment_method,
  p_customer_note text default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_business uuid;
  v_status account_status;
  v_min int;
  v_cod boolean;
  v_bank boolean;
  v_total_trays int := 0;
  v_subtotal numeric := 0;
  v_fee numeric := 0;
  v_order_id uuid;
  v_order_no text;
  v_unit numeric;
  v_avail int;
  r record;
begin
  if v_uid is null then raise exception 'Not authenticated'; end if;

  select id, status into v_business, v_status
  from businesses where owner_user_id = v_uid limit 1;
  if v_business is null then raise exception 'No business profile found for this account'; end if;
  if v_status <> 'approved' then raise exception 'Your business account is not approved yet'; end if;

  select min_order_trays, cod_enabled, bank_transfer_enabled
  into v_min, v_cod, v_bank from app_settings where id;

  if p_payment_method = 'cod' and not coalesce(v_cod, false) then
    raise exception 'Cash on delivery is currently unavailable';
  end if;
  if p_payment_method = 'bank_transfer' and not coalesce(v_bank, true) then
    raise exception 'Bank transfer is currently unavailable';
  end if;

  select coalesce(sum(qty_trays), 0) into v_total_trays from cart_items where user_id = v_uid;
  if v_total_trays = 0 then raise exception 'Your cart is empty'; end if;
  if v_total_trays < coalesce(v_min, 1) then
    raise exception 'Minimum order is % trays', v_min;
  end if;

  if p_fulfillment = 'delivery' then
    if p_zone_id is null then raise exception 'A delivery zone is required'; end if;
    select base_fee + per_tray_fee * v_total_trays into v_fee
    from delivery_zones where id = p_zone_id and is_active;
    if v_fee is null then raise exception 'Invalid or inactive delivery zone'; end if;
  end if;

  v_order_no := 'CC-' || to_char(now(), 'YYYY') || '-' ||
                lpad(nextval('order_number_seq')::text, 5, '0');

  insert into orders (
    order_number, business_id, fulfillment_type, delivery_zone_id, delivery_address,
    scheduled_date, payment_method, payment_status, customer_note, currency
  ) values (
    v_order_no, v_business, p_fulfillment,
    case when p_fulfillment = 'delivery' then p_zone_id else null end,
    p_address, p_scheduled_date, p_payment_method, 'unpaid', p_customer_note, 'LKR'
  ) returning id into v_order_id;

  for r in
    select c.product_id, c.qty_trays, p.name, p.size_grade, p.weight_min_g, p.weight_max_g
    from cart_items c
    join products p on p.id = c.product_id
    where c.user_id = v_uid
    order by c.product_id
  loop
    -- Lock the inventory row to prevent overselling under concurrency.
    select (trays_on_hand - trays_reserved) into v_avail
    from inventory where product_id = r.product_id for update;
    v_avail := coalesce(v_avail, 0);

    if r.qty_trays > v_avail then
      raise exception 'Not enough stock for % (only % trays available)', r.name, v_avail;
    end if;

    v_unit := resolve_unit_price(r.product_id, r.qty_trays);
    if v_unit is null then raise exception 'No price is set for %', r.name; end if;

    insert into order_items (
      order_id, product_id, product_name_snapshot, grade_snapshot,
      weight_range_snapshot, unit_price_snapshot, qty_trays, line_total
    ) values (
      v_order_id, r.product_id, r.name, r.size_grade::text,
      case when r.weight_min_g is not null
           then r.weight_min_g || '–' || r.weight_max_g || ' g' else null end,
      v_unit, r.qty_trays, v_unit * r.qty_trays
    );

    update inventory
    set trays_reserved = trays_reserved + r.qty_trays, updated_at = now()
    where product_id = r.product_id;

    insert into stock_movements (product_id, change_trays, type, order_id, note, created_by)
    values (r.product_id, -r.qty_trays, 'reserve', v_order_id, 'Reserved on ' || v_order_no, v_uid);

    v_subtotal := v_subtotal + v_unit * r.qty_trays;
  end loop;

  update orders
  set subtotal = v_subtotal, delivery_fee = v_fee, total = v_subtotal + v_fee
  where id = v_order_id;

  insert into payments (order_id, method, amount, status)
  values (v_order_id, p_payment_method, v_subtotal + v_fee, 'unpaid');

  delete from cart_items where user_id = v_uid;

  return v_order_id;
end;
$$;

-- Move reserved trays out of physical stock (on delivery/completion).
create or replace function fulfill_order_stock(p_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r record; v_no text;
begin
  select order_number into v_no from orders where id = p_order_id;
  for r in select product_id, qty_trays from order_items
           where order_id = p_order_id and product_id is not null
  loop
    update inventory set
      trays_on_hand = greatest(trays_on_hand - r.qty_trays, 0),
      trays_reserved = greatest(trays_reserved - r.qty_trays, 0),
      updated_at = now()
    where product_id = r.product_id;
    insert into stock_movements (product_id, change_trays, type, order_id, note, created_by)
    values (r.product_id, -r.qty_trays, 'fulfill', p_order_id, 'Fulfilled ' || coalesce(v_no, ''), auth.uid());
  end loop;
end;
$$;

-- Return reserved trays to free stock (on cancellation).
create or replace function release_order_stock(p_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r record; v_no text;
begin
  select order_number into v_no from orders where id = p_order_id;
  for r in select product_id, qty_trays from order_items
           where order_id = p_order_id and product_id is not null
  loop
    update inventory set
      trays_reserved = greatest(trays_reserved - r.qty_trays, 0),
      updated_at = now()
    where product_id = r.product_id;
    insert into stock_movements (product_id, change_trays, type, order_id, note, created_by)
    values (r.product_id, r.qty_trays, 'release', p_order_id, 'Released ' || coalesce(v_no, ''), auth.uid());
  end loop;
end;
$$;

-- Staff: advance an order through its lifecycle (with stock side effects).
create or replace function set_order_status(p_order_id uuid, p_new order_status, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_old order_status; v_method payment_method;
begin
  if not is_staff() then raise exception 'Forbidden'; end if;

  select status, payment_method into v_old, v_method
  from orders where id = p_order_id for update;
  if v_old is null then raise exception 'Order not found'; end if;
  if v_old = p_new then return; end if;
  if v_old in ('delivered','completed','cancelled') then
    raise exception 'Order is already %; status cannot be changed', v_old;
  end if;

  if p_new = 'cancelled' then
    perform release_order_stock(p_order_id);
    update orders set status = 'cancelled', cancelled_at = now(),
      cancel_reason = p_note, updated_at = now()
    where id = p_order_id;
    return;
  end if;

  if p_new in ('delivered','completed') then
    perform fulfill_order_stock(p_order_id);
  end if;

  update orders set
    status = p_new,
    confirmed_at = case when p_new = 'confirmed' and confirmed_at is null then now() else confirmed_at end,
    delivered_at = case when p_new in ('delivered','completed') and delivered_at is null then now() else delivered_at end,
    payment_status = case when p_new in ('delivered','completed') and v_method = 'cod' then 'paid_cod' else payment_status end,
    updated_at = now()
  where id = p_order_id;
end;
$$;

-- Customer/staff: attach a bank transfer slip to an order.
create or replace function upload_payment_slip(p_order_id uuid, p_url text)
returns void language plpgsql security definer set search_path = public as $$
declare v_owner uuid;
begin
  select b.owner_user_id into v_owner
  from orders o join businesses b on b.id = o.business_id
  where o.id = p_order_id;
  if v_owner is null then raise exception 'Order not found'; end if;
  if v_owner <> auth.uid() and not is_staff() then raise exception 'Forbidden'; end if;

  update payments set slip_url = p_url, status = 'slip_uploaded',
    uploaded_at = now(), updated_at = now()
  where order_id = p_order_id;
  update orders set payment_status = 'slip_uploaded', updated_at = now()
  where id = p_order_id;
end;
$$;

-- Staff: verify or reject a payment.
create or replace function verify_payment(p_payment_id uuid, p_approve boolean, p_reason text default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_order uuid;
begin
  if not is_staff() then raise exception 'Forbidden'; end if;
  select order_id into v_order from payments where id = p_payment_id;
  if v_order is null then raise exception 'Payment not found'; end if;

  if p_approve then
    update payments set status = 'verified', verified_by = auth.uid(),
      verified_at = now(), reject_reason = null, updated_at = now()
    where id = p_payment_id;
    update orders set payment_status = 'verified', updated_at = now() where id = v_order;
    update orders set status = 'confirmed', confirmed_at = coalesce(confirmed_at, now()),
      updated_at = now()
    where id = v_order and status = 'pending';
  else
    update payments set status = 'rejected', reject_reason = p_reason,
      verified_by = auth.uid(), verified_at = now(), updated_at = now()
    where id = p_payment_id;
    update orders set payment_status = 'rejected', updated_at = now() where id = v_order;
  end if;
end;
$$;

-- Inventory roles: log daily production.
create or replace function add_production(p_product_id uuid, p_trays int, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not has_role(array['admin','manager','inventory']::user_role[]) then raise exception 'Forbidden'; end if;
  if p_trays <= 0 then raise exception 'Trays must be a positive number'; end if;
  insert into inventory (product_id, trays_on_hand) values (p_product_id, p_trays)
  on conflict (product_id) do update
    set trays_on_hand = inventory.trays_on_hand + excluded.trays_on_hand, updated_at = now();
  insert into stock_movements (product_id, change_trays, type, note, created_by)
  values (p_product_id, p_trays, 'production_in', p_note, auth.uid());
end;
$$;

-- Inventory roles: manual stock adjustment (positive = adjustment, negative = wastage).
create or replace function adjust_stock(p_product_id uuid, p_delta int, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not has_role(array['admin','manager','inventory']::user_role[]) then raise exception 'Forbidden'; end if;
  if p_delta = 0 then return; end if;
  insert into inventory (product_id, trays_on_hand) values (p_product_id, greatest(p_delta, 0))
  on conflict (product_id) do update
    set trays_on_hand = greatest(inventory.trays_on_hand + p_delta, 0), updated_at = now();
  insert into stock_movements (product_id, change_trays, type, note, created_by)
  values (p_product_id, p_delta, case when p_delta < 0 then 'wastage' else 'adjustment' end, p_note, auth.uid());
end;
$$;

-- Sales/managers: assign an order to a delivery person.
create or replace function assign_delivery(p_order_id uuid, p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not has_role(array['admin','manager','sales']::user_role[]) then raise exception 'Forbidden'; end if;
  update orders set assigned_delivery_user_id = p_user, updated_at = now() where id = p_order_id;
  insert into deliveries (order_id, assigned_user_id, status)
  values (p_order_id, p_user, 'assigned')
  on conflict (order_id) do update
    set assigned_user_id = excluded.assigned_user_id, status = 'assigned', updated_at = now();
end;
$$;
