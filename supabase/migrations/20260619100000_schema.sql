-- ============================================================================
-- CoopCart — Schema (enums, tables, indexes, triggers, role helpers)
-- Run once (e.g. Supabase SQL editor or `supabase db push`).
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type user_role as enum ('admin','manager','sales','inventory','delivery','customer');
create type account_status as enum ('pending','approved','suspended','rejected');
create type business_type as enum ('shop','bakery','restaurant','hotel','catering','wholesaler','other');
create type egg_color as enum ('brown','white','tinted');
create type size_grade as enum ('small','medium','large','extra_large','jumbo','mixed');
create type order_status as enum ('pending','confirmed','packed','out_for_delivery','ready_for_pickup','delivered','completed','cancelled');
create type payment_method as enum ('bank_transfer','cod');
create type payment_status as enum ('unpaid','slip_uploaded','verified','rejected','paid_cod');
create type fulfillment_type as enum ('delivery','pickup');
create type stock_movement_type as enum ('production_in','reserve','release','fulfill','adjustment','wastage');

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table delivery_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  base_fee numeric(12,2) not null default 0,
  per_tray_fee numeric(12,2) not null default 0,
  delivery_days text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'customer',
  full_name text,
  email text,
  phone text,
  preferred_language text not null default 'en',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table businesses (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  business_name text not null,
  business_type business_type not null default 'other',
  br_number text,
  contact_person text,
  phone text,
  email text,
  address_line1 text,
  address_line2 text,
  city text,
  delivery_zone_id uuid references delivery_zones(id),
  status account_status not null default 'pending',
  cod_limit numeric(12,2),
  notes text,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index businesses_owner_idx on businesses(owner_user_id);
create index businesses_status_idx on businesses(status);

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  egg_color egg_color not null default 'brown',
  size_grade size_grade not null,
  weight_min_g int,
  weight_max_g int,
  description text,
  image_url text,
  eggs_per_tray int not null default 30,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  price_per_tray numeric(12,2) not null,
  effective_from timestamptz not null default now(),
  set_by uuid references auth.users(id)
);
create index product_prices_lookup_idx on product_prices(product_id, effective_from desc);

create table price_tiers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  min_qty_trays int not null,
  max_qty_trays int,
  price_per_tray numeric(12,2) not null,
  is_custom_quote boolean not null default false,
  created_at timestamptz not null default now(),
  unique (product_id, min_qty_trays)
);

create table inventory (
  product_id uuid primary key references products(id) on delete cascade,
  trays_on_hand int not null default 0,
  trays_reserved int not null default 0,
  low_stock_threshold int not null default 20,
  updated_at timestamptz not null default now()
);

create table stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  change_trays int not null,
  type stock_movement_type not null,
  order_id uuid,
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index stock_movements_product_idx on stock_movements(product_id, created_at desc);

create table cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  qty_trays int not null check (qty_trays > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create sequence if not exists order_number_seq;

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  business_id uuid not null references businesses(id),
  status order_status not null default 'pending',
  fulfillment_type fulfillment_type not null,
  delivery_zone_id uuid references delivery_zones(id),
  delivery_address text,
  scheduled_date date,
  payment_method payment_method not null,
  payment_status payment_status not null default 'unpaid',
  subtotal numeric(12,2) not null default 0,
  delivery_fee numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  currency text not null default 'LKR',
  customer_note text,
  internal_note text,
  assigned_delivery_user_id uuid references auth.users(id),
  placed_at timestamptz not null default now(),
  confirmed_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  cancel_reason text,
  updated_at timestamptz not null default now()
);
create index orders_business_idx on orders(business_id);
create index orders_status_idx on orders(status);
create index orders_placed_idx on orders(placed_at desc);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name_snapshot text not null,
  grade_snapshot text,
  weight_range_snapshot text,
  unit_price_snapshot numeric(12,2) not null,
  qty_trays int not null check (qty_trays > 0),
  line_total numeric(12,2) not null
);
create index order_items_order_idx on order_items(order_id);

create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  method payment_method not null,
  amount numeric(12,2) not null,
  status payment_status not null default 'unpaid',
  slip_url text,
  reference text,
  uploaded_at timestamptz,
  verified_by uuid references auth.users(id),
  verified_at timestamptz,
  reject_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_order_idx on payments(order_id);

create table delivery_blackout_dates (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid references delivery_zones(id) on delete cascade,
  date date not null,
  reason text,
  created_at timestamptz not null default now()
);

create table deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade unique,
  assigned_user_id uuid references auth.users(id),
  status text not null default 'assigned',
  delivered_at timestamptz,
  proof_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table bank_accounts (
  id uuid primary key default gen_random_uuid(),
  account_name text not null,
  bank_name text not null,
  branch text,
  account_number text not null,
  instructions text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table app_settings (
  id boolean primary key default true,
  order_cutoff_time time not null default '18:00',
  min_order_trays int not null default 5,
  currency text not null default 'LKR',
  cod_enabled boolean not null default true,
  bank_transfer_enabled boolean not null default true,
  timezone text not null default 'Asia/Colombo',
  default_locale text not null default 'en',
  contact_phone text,
  contact_email text,
  contact_address text,
  updated_at timestamptz not null default now(),
  constraint app_settings_singleton check (id)
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on notifications(user_id, is_read);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id),
  action text not null,
  entity text,
  entity_id text,
  meta jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create trigger t_delivery_zones_updated before update on delivery_zones for each row execute function set_updated_at();
create trigger t_profiles_updated before update on profiles for each row execute function set_updated_at();
create trigger t_businesses_updated before update on businesses for each row execute function set_updated_at();
create trigger t_products_updated before update on products for each row execute function set_updated_at();
create trigger t_inventory_updated before update on inventory for each row execute function set_updated_at();
create trigger t_cart_items_updated before update on cart_items for each row execute function set_updated_at();
create trigger t_orders_updated before update on orders for each row execute function set_updated_at();
create trigger t_payments_updated before update on payments for each row execute function set_updated_at();
create trigger t_deliveries_updated before update on deliveries for each row execute function set_updated_at();
create trigger t_bank_accounts_updated before update on bank_accounts for each row execute function set_updated_at();
create trigger t_app_settings_updated before update on app_settings for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Role / ownership helpers (SECURITY DEFINER so RLS policies can use them
-- without recursive policy evaluation)
-- ---------------------------------------------------------------------------
create or replace function app_role() returns user_role
  language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_admin() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function is_staff() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('admin','manager','sales','inventory','delivery')
  );
$$;

create or replace function has_role(roles user_role[]) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = any(roles));
$$;

create or replace function my_business_id() returns uuid
  language sql stable security definer set search_path = public as $$
  select id from businesses where owner_user_id = auth.uid() limit 1;
$$;

create or replace function my_business_approved() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from businesses where owner_user_id = auth.uid() and status = 'approved');
$$;

-- ---------------------------------------------------------------------------
-- Auth: create a profile row for every new user (defaults to customer)
-- ---------------------------------------------------------------------------
create or replace function handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'phone', ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Prevent non-admins from escalating their own role.
create or replace function guard_profile_role() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not is_admin() then
    raise exception 'Only an admin can change a user role';
  end if;
  return new;
end;
$$;
create trigger profiles_guard_role before update on profiles
  for each row execute function guard_profile_role();

-- Prevent customers from changing their own account status / credit limit.
create or replace function guard_business() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if not has_role(array['admin','manager','sales']::user_role[]) then
    if new.status is distinct from old.status
       or new.cod_limit is distinct from old.cod_limit then
      raise exception 'Not allowed to change account status or credit limit';
    end if;
  end if;
  return new;
end;
$$;
create trigger businesses_guard before update on businesses
  for each row execute function guard_business();
