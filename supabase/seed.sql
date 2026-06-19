-- ============================================================================
-- CoopCart — Seed (reference data). Safe to re-run.
-- NOTE: money values are PLACEHOLDERS (marked TODO) — replace with the farm's
-- real wholesale prices and delivery fees. Bank details must be provided by the
-- farm owner. Staff/customer accounts are created via auth (see scripts/README).
-- ============================================================================

-- App settings (singleton)
insert into app_settings (id, contact_phone, contact_email, contact_address)
values (true, '+94 00 000 0000', 'hello@coopcart.lk', 'Negombo, Sri Lanka')
on conflict (id) do nothing;

-- Delivery zones (TODO: real fees) — days: mon/wed/fri/sat
insert into delivery_zones (name, base_fee, per_tray_fee, delivery_days) values
  ('Negombo',         300, 8,  array['mon','wed','fri','sat']),
  ('Katunayake',      350, 8,  array['mon','wed','fri','sat']),
  ('Seeduwa',         350, 8,  array['mon','wed','fri','sat']),
  ('Ja-Ela',          400, 9,  array['mon','wed','fri','sat']),
  ('Wattala',         450, 9,  array['mon','wed','fri','sat']),
  ('Colombo suburbs', 600, 10, array['mon','wed','fri','sat'])
on conflict (name) do nothing;

-- Products — active brown grades + a couple of inactive examples
insert into products (id, name, egg_color, size_grade, weight_min_g, weight_max_g, description, eggs_per_tray, sort_order, is_active) values
  ('a1000000-0000-4000-8000-000000000001', 'Brown Eggs — Medium',      'brown', 'medium',      49, 55, 'Fresh brown table eggs, medium grade.',      30, 1,  true),
  ('a1000000-0000-4000-8000-000000000002', 'Brown Eggs — Large',       'brown', 'large',       56, 62, 'Fresh brown table eggs, large grade.',       30, 2,  true),
  ('a1000000-0000-4000-8000-000000000003', 'Brown Eggs — Extra Large', 'brown', 'extra_large', 63, 70, 'Fresh brown table eggs, extra large grade.', 30, 3,  true),
  ('a1000000-0000-4000-8000-000000000010', 'White Eggs — Large',       'white', 'large',       56, 62, 'Inactive — enable when regularly available.', 30, 10, false),
  ('a1000000-0000-4000-8000-000000000011', 'Mixed Size Eggs',          'brown', 'mixed',       null, null, 'Inactive — assorted sizes.',               30, 11, false)
on conflict (id) do nothing;

-- Current base prices (TODO: real LKR per tray)
insert into product_prices (product_id, price_per_tray)
select v.pid, v.price from (values
  ('a1000000-0000-4000-8000-000000000001'::uuid, 700::numeric),
  ('a1000000-0000-4000-8000-000000000002'::uuid, 800::numeric),
  ('a1000000-0000-4000-8000-000000000003'::uuid, 900::numeric)
) as v(pid, price)
where not exists (select 1 from product_prices pp where pp.product_id = v.pid);

-- Bulk price tiers (TODO: real LKR). 5–9 / 10–24 / 25–49 / 50+
insert into price_tiers (product_id, min_qty_trays, max_qty_trays, price_per_tray)
select v.pid, v.lo, v.hi, v.price from (values
  ('a1000000-0000-4000-8000-000000000001'::uuid, 5,  9,    700::numeric),
  ('a1000000-0000-4000-8000-000000000001'::uuid, 10, 24,   680::numeric),
  ('a1000000-0000-4000-8000-000000000001'::uuid, 25, 49,   660::numeric),
  ('a1000000-0000-4000-8000-000000000001'::uuid, 50, null, 640::numeric),
  ('a1000000-0000-4000-8000-000000000002'::uuid, 5,  9,    800::numeric),
  ('a1000000-0000-4000-8000-000000000002'::uuid, 10, 24,   775::numeric),
  ('a1000000-0000-4000-8000-000000000002'::uuid, 25, 49,   755::numeric),
  ('a1000000-0000-4000-8000-000000000002'::uuid, 50, null, 730::numeric),
  ('a1000000-0000-4000-8000-000000000003'::uuid, 5,  9,    900::numeric),
  ('a1000000-0000-4000-8000-000000000003'::uuid, 10, 24,   875::numeric),
  ('a1000000-0000-4000-8000-000000000003'::uuid, 25, 49,   850::numeric),
  ('a1000000-0000-4000-8000-000000000003'::uuid, 50, null, 825::numeric)
) as v(pid, lo, hi, price)
where not exists (
  select 1 from price_tiers t where t.product_id = v.pid and t.min_qty_trays = v.lo
);

-- Opening inventory for active products
insert into inventory (product_id, trays_on_hand, low_stock_threshold) values
  ('a1000000-0000-4000-8000-000000000001', 240, 30),
  ('a1000000-0000-4000-8000-000000000002', 300, 30),
  ('a1000000-0000-4000-8000-000000000003', 180, 30)
on conflict (product_id) do nothing;

-- Bank account — PLACEHOLDER. The farm owner must supply real details.
insert into bank_accounts (id, account_name, bank_name, branch, account_number, instructions, is_active)
values (
  'b1000000-0000-4000-8000-000000000001',
  '[TO BE PROVIDED BY FARM OWNER]', '[Bank name]', '[Branch]', '[Account number]',
  'Use your order number as the payment reference.', true
)
on conflict (id) do nothing;
