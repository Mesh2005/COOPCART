-- ===========================================================================
-- Auto-create in-app notifications for the business owner on key events.
-- ===========================================================================

create or replace function notify_order_status() returns trigger
  language plpgsql security definer set search_path = public as $$
declare v_owner uuid;
begin
  if new.status is distinct from old.status then
    select owner_user_id into v_owner from businesses where id = new.business_id;
    if v_owner is not null then
      insert into notifications (user_id, type, title, link)
      values (
        v_owner, 'order',
        'Order ' || new.order_number || ' is ' || replace(new.status::text, '_', ' '),
        '/app/orders/' || new.id
      );
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists orders_notify on orders;
create trigger orders_notify after update on orders
  for each row execute function notify_order_status();

create or replace function notify_business_status() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status and new.owner_user_id is not null then
    insert into notifications (user_id, type, title, link)
    values (
      new.owner_user_id, 'account',
      case new.status
        when 'approved' then 'Your account was approved — you can now order'
        when 'rejected' then 'Your account was not approved'
        when 'suspended' then 'Your account was suspended'
        else 'Account status updated'
      end,
      '/app'
    );
  end if;
  return new;
end;
$$;
drop trigger if exists businesses_notify on businesses;
create trigger businesses_notify after update on businesses
  for each row execute function notify_business_status();

create or replace function notify_payment_status() returns trigger
  language plpgsql security definer set search_path = public as $$
declare v_owner uuid; v_no text;
begin
  if new.status is distinct from old.status and new.status in ('verified', 'rejected') then
    select b.owner_user_id, o.order_number into v_owner, v_no
    from orders o join businesses b on b.id = o.business_id
    where o.id = new.order_id;
    if v_owner is not null then
      insert into notifications (user_id, type, title, link)
      values (
        v_owner, 'payment',
        'Payment ' || new.status || ' for ' || coalesce(v_no, 'your order'),
        '/app/orders/' || new.order_id
      );
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists payments_notify on payments;
create trigger payments_notify after update on payments
  for each row execute function notify_payment_status();

-- Notify staff (admin/manager/sales) when a new order is placed.
create or replace function notify_staff_new_order() returns trigger
  language plpgsql security definer set search_path = public as $$
declare v_biz text;
begin
  select business_name into v_biz from businesses where id = new.business_id;
  insert into notifications (user_id, type, title, link)
  select p.id, 'order',
    'New order ' || new.order_number || ' from ' || coalesce(v_biz, 'a customer'),
    '/admin/orders/' || new.id
  from profiles p
  where p.role in ('admin', 'manager', 'sales');
  return new;
end;
$$;
drop trigger if exists orders_notify_staff on orders;
create trigger orders_notify_staff after insert on orders
  for each row execute function notify_staff_new_order();

-- Stream notifications to the bell in real time.
do $$
begin
  begin
    alter publication supabase_realtime add table notifications;
  exception when duplicate_object then null;
  end;
end $$;
