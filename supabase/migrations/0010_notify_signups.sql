-- Email capture for the fake-door pricing CTA on college pages.
-- Apply via Supabase Studio → SQL Editor → paste-and-run, or via the
-- Supabase CLI: `supabase db push`.

create table if not exists notify_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null,
  created_at timestamptz default now()
);

create index if not exists notify_signups_email_idx on notify_signups (email);
create index if not exists notify_signups_created_at_idx on notify_signups (created_at desc);

-- RLS: only the service role inserts. Anonymous reads disallowed.
alter table notify_signups enable row level security;
-- (No policies defined → no one can SELECT/UPDATE/DELETE via the public/anon role.)
