-- Track which conversations are waiting on a staff reply (for the unread badge).
alter table chat_conversations
  add column if not exists awaiting_staff boolean not null default false;

-- The bump trigger now flags awaiting_staff true on a customer message and
-- clears it on a staff reply.
create or replace function bump_conversation() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  update chat_conversations
    set last_message_at = now(),
        status = case when status = 'closed' then 'open' else status end,
        awaiting_staff = (new.sender_role = 'customer')
  where id = new.conversation_id;
  return new;
end;
$$;
