-- ===========================================================================
-- Email OTP verification for signup
-- Codes are written/read only by server actions using the service role, so
-- RLS is enabled with no policies (denies all anon/authenticated access).
-- ===========================================================================
create table if not exists email_otps (
  email text primary key,
  code_hash text not null,
  purpose text not null default 'signup',
  expires_at timestamptz not null,
  attempts int not null default 0,
  created_at timestamptz not null default now()
);

alter table email_otps enable row level security;
