-- ===========================================================================
-- Live chat: authenticated customers <-> staff, over Supabase Realtime.
-- ===========================================================================
create table if not exists chat_conversations (
  id uuid primary key default gen_random_uuid(),
  customer_user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid references businesses(id) on delete set null,
  status text not null default 'open', -- open | closed
  assigned_staff_id uuid references auth.users(id) on delete set null,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists chat_conv_customer_idx on chat_conversations(customer_user_id);
create index if not exists chat_conv_status_idx on chat_conversations(status, last_message_at desc);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references chat_conversations(id) on delete cascade,
  sender_role text not null, -- customer | staff
  sender_user_id uuid references auth.users(id) on delete set null,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists chat_msg_conv_idx on chat_messages(conversation_id, created_at);

alter table chat_conversations enable row level security;
alter table chat_messages enable row level security;

-- Customers see/own their conversation; staff see all.
drop policy if exists chat_conv_select on chat_conversations;
create policy chat_conv_select on chat_conversations for select
  using (customer_user_id = auth.uid() or is_staff());
drop policy if exists chat_conv_insert on chat_conversations;
create policy chat_conv_insert on chat_conversations for insert
  with check (customer_user_id = auth.uid());
drop policy if exists chat_conv_update on chat_conversations;
create policy chat_conv_update on chat_conversations for update
  using (customer_user_id = auth.uid() or is_staff())
  with check (customer_user_id = auth.uid() or is_staff());

drop policy if exists chat_msg_select on chat_messages;
create policy chat_msg_select on chat_messages for select
  using (exists (
    select 1 from chat_conversations c
    where c.id = conversation_id and (c.customer_user_id = auth.uid() or is_staff())
  ));
drop policy if exists chat_msg_insert on chat_messages;
create policy chat_msg_insert on chat_messages for insert
  with check (
    sender_user_id = auth.uid()
    and exists (
      select 1 from chat_conversations c
      where c.id = conversation_id and (c.customer_user_id = auth.uid() or is_staff())
    )
  );

-- Keep the conversation's last_message_at current and reopen on new activity.
create or replace function bump_conversation() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  update chat_conversations
    set last_message_at = now(),
        status = case when status = 'closed' then 'open' else status end
  where id = new.conversation_id;
  return new;
end;
$$;
drop trigger if exists chat_msg_bump on chat_messages;
create trigger chat_msg_bump after insert on chat_messages
  for each row execute function bump_conversation();

-- Realtime streaming (ignore if already present).
do $$
begin
  begin
    alter publication supabase_realtime add table chat_messages;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table chat_conversations;
  exception when duplicate_object then null;
  end;
end $$;
