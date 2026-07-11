-- ===========================================================================
-- Order tracking
-- A timestamped status-history trail for every order, so customers can follow
-- their order stage-by-stage. Rows are written by a trigger (not the client),
-- and streamed to the tracking page over Realtime.
-- ===========================================================================

create table if not exists order_events (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references orders(id) on delete cascade,
  status     order_status not null,
  note       text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists order_events_order_idx on order_events(order_id, created_at);

alter table order_events enable row level security;

-- Customers can read the trail for their own orders; staff can read all.
drop policy if exists order_events_select on order_events;
create policy order_events_select on order_events for select
  using (
    exists (
      select 1 from orders o
      where o.id = order_events.order_id
        and (o.business_id = my_business_id() or is_staff())
    )
  );
-- No client insert/update/delete policies: only the SECURITY DEFINER trigger
-- below writes rows (and it bypasses RLS).

-- Append an event whenever an order is created or its status changes.
create or replace function log_order_event() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into order_events (order_id, status, note, created_by)
    values (new.id, new.status, 'Order placed', auth.uid());
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    insert into order_events (order_id, status, note, created_by)
    values (
      new.id, new.status,
      case when new.status = 'cancelled' then new.cancel_reason else null end,
      auth.uid()
    );
  end if;
  return new;
end;
$$;

drop trigger if exists orders_log_event on orders;
create trigger orders_log_event after insert or update on orders
  for each row execute function log_order_event();

-- Backfill history for orders placed before this table existed, so their
-- trackers are populated immediately. Timestamps come from columns we already
-- keep. Guarded so the migration is safe to re-run.
insert into order_events (order_id, status, created_at)
select o.id, 'pending', o.placed_at from orders o
where not exists (
  select 1 from order_events e where e.order_id = o.id and e.status = 'pending'
);

insert into order_events (order_id, status, created_at)
select o.id, 'confirmed', o.confirmed_at from orders o
where o.confirmed_at is not null
  and not exists (
    select 1 from order_events e where e.order_id = o.id and e.status = 'confirmed'
  );

insert into order_events (order_id, status, created_at)
select o.id, 'delivered', o.delivered_at from orders o
where o.delivered_at is not null
  and not exists (
    select 1 from order_events e
    where e.order_id = o.id and e.status in ('delivered', 'completed')
  );

insert into order_events (order_id, status, created_at)
select o.id, 'cancelled', o.cancelled_at from orders o
where o.cancelled_at is not null
  and not exists (
    select 1 from order_events e where e.order_id = o.id and e.status = 'cancelled'
  );

-- Stream the trail (and order-row updates) to the customer tracking page.
do $$
begin
  begin alter publication supabase_realtime add table order_events; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table orders;       exception when duplicate_object then null; end;
end $$;
