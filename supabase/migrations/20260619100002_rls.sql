-- ============================================================================
-- CoopCart — Row-Level Security policies + Storage buckets
-- ============================================================================

alter table profiles enable row level security;
alter table businesses enable row level security;
alter table delivery_zones enable row level security;
alter table delivery_blackout_dates enable row level security;
alter table products enable row level security;
alter table product_prices enable row level security;
alter table price_tiers enable row level security;
alter table inventory enable row level security;
alter table stock_movements enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table deliveries enable row level security;
alter table bank_accounts enable row level security;
alter table app_settings enable row level security;
alter table notifications enable row level security;
alter table audit_log enable row level security;

-- ---- profiles -------------------------------------------------------------
create policy profiles_select on profiles for select
  using (id = auth.uid() or is_staff());
create policy profiles_update on profiles for update
  using (id = auth.uid() or is_admin())
  with check (id = auth.uid() or is_admin());

-- ---- businesses -----------------------------------------------------------
create policy businesses_select on businesses for select
  using (owner_user_id = auth.uid() or is_staff());
create policy businesses_insert on businesses for insert
  with check (owner_user_id = auth.uid());
create policy businesses_update on businesses for update
  using (owner_user_id = auth.uid() or has_role(array['admin','manager','sales']::user_role[]))
  with check (owner_user_id = auth.uid() or has_role(array['admin','manager','sales']::user_role[]));

-- ---- delivery zones / blackout dates --------------------------------------
create policy zones_select on delivery_zones for select
  using (is_active or is_staff());
create policy zones_write on delivery_zones for all
  using (has_role(array['admin','manager','sales']::user_role[]))
  with check (has_role(array['admin','manager','sales']::user_role[]));

create policy blackout_select on delivery_blackout_dates for select using (true);
create policy blackout_write on delivery_blackout_dates for all
  using (has_role(array['admin','manager','sales']::user_role[]))
  with check (has_role(array['admin','manager','sales']::user_role[]));

-- ---- products (public catalogue) ------------------------------------------
create policy products_select on products for select
  using (is_active or is_staff());
create policy products_write on products for all
  using (has_role(array['admin','manager','inventory']::user_role[]))
  with check (has_role(array['admin','manager','inventory']::user_role[]));

-- ---- prices & tiers (gated to approved buyers + staff) --------------------
create policy prices_select on product_prices for select
  using (is_staff() or my_business_approved());
create policy prices_write on product_prices for all
  using (has_role(array['admin','manager','inventory']::user_role[]))
  with check (has_role(array['admin','manager','inventory']::user_role[]));

create policy tiers_select on price_tiers for select
  using (is_staff() or my_business_approved());
create policy tiers_write on price_tiers for all
  using (has_role(array['admin','manager','inventory']::user_role[]))
  with check (has_role(array['admin','manager','inventory']::user_role[]));

-- ---- inventory ------------------------------------------------------------
create policy inventory_select on inventory for select
  using (is_staff() or my_business_approved());
create policy inventory_write on inventory for all
  using (has_role(array['admin','manager','inventory']::user_role[]))
  with check (has_role(array['admin','manager','inventory']::user_role[]));

-- ---- stock movements ------------------------------------------------------
create policy movements_select on stock_movements for select using (is_staff());

-- ---- cart -----------------------------------------------------------------
create policy cart_all on cart_items for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---- orders ---------------------------------------------------------------
create policy orders_select on orders for select
  using (business_id = my_business_id() or is_staff());
create policy orders_update_staff on orders for update
  using (is_staff())
  with check (is_staff());

-- ---- order items ----------------------------------------------------------
create policy order_items_select on order_items for select
  using (exists (
    select 1 from orders o
    where o.id = order_items.order_id
      and (o.business_id = my_business_id() or is_staff())
  ));

-- ---- payments -------------------------------------------------------------
create policy payments_select on payments for select
  using (exists (
    select 1 from orders o
    where o.id = payments.order_id
      and (o.business_id = my_business_id() or is_staff())
  ));

-- ---- deliveries -----------------------------------------------------------
create policy deliveries_select on deliveries for select
  using (assigned_user_id = auth.uid() or has_role(array['admin','manager','sales']::user_role[]));
create policy deliveries_update on deliveries for update
  using (assigned_user_id = auth.uid() or has_role(array['admin','manager','sales']::user_role[]))
  with check (assigned_user_id = auth.uid() or has_role(array['admin','manager','sales']::user_role[]));

-- ---- bank accounts --------------------------------------------------------
create policy bank_select on bank_accounts for select using (is_active or is_staff());
create policy bank_write on bank_accounts for all
  using (has_role(array['admin','manager']::user_role[]))
  with check (has_role(array['admin','manager']::user_role[]));

-- ---- app settings ---------------------------------------------------------
create policy settings_select on app_settings for select using (true);
create policy settings_write on app_settings for all
  using (has_role(array['admin','manager']::user_role[]))
  with check (has_role(array['admin','manager']::user_role[]));

-- ---- notifications --------------------------------------------------------
create policy notifications_select on notifications for select
  using (user_id = auth.uid());
create policy notifications_update on notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
create policy notifications_insert on notifications for insert
  with check (user_id = auth.uid() or is_staff());

-- ---- audit log ------------------------------------------------------------
create policy audit_select on audit_log for select using (is_staff());

-- ===========================================================================
-- Storage buckets
-- ===========================================================================
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('payment-slips', 'payment-slips', false)
  on conflict (id) do nothing;

-- product-images: world-readable, staff-writable
create policy product_images_read on storage.objects for select
  using (bucket_id = 'product-images');
create policy product_images_write on storage.objects for all
  using (bucket_id = 'product-images' and public.is_staff())
  with check (bucket_id = 'product-images' and public.is_staff());

-- payment-slips: stored under <user_id>/..., owner + staff can read; owner uploads
create policy slips_read on storage.objects for select
  using (
    bucket_id = 'payment-slips'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff())
  );
create policy slips_insert on storage.objects for insert
  with check (
    bucket_id = 'payment-slips'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy slips_update on storage.objects for update
  using (
    bucket_id = 'payment-slips'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
