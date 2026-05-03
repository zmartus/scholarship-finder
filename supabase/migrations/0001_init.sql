-- Initial schema for scholarship-finder.
-- Apply via Supabase dashboard SQL editor or `supabase db push` after `supabase link`.

create extension if not exists "pgcrypto";

create table colleges (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  city text,
  state text not null,
  website text,
  type text,
  created_at timestamptz default now()
);
create index colleges_state_idx on colleges (state);
create index colleges_name_search_idx on colleges using gin (to_tsvector('english', name));

create table scholarships (
  id uuid primary key default gen_random_uuid(),
  external_id text,
  source text not null,
  source_url text not null,
  name text not null,
  description text,
  amount_min numeric,
  amount_max numeric,
  deadline date,
  eligibility_text text,
  scope text not null check (scope in ('school','local','state','national')),
  college_id uuid references colleges (id) on delete set null,
  tags text[] default '{}',
  last_scraped timestamptz default now(),
  active boolean default true,
  created_at timestamptz default now(),
  unique (source, external_id)
);
create index scholarships_deadline_idx on scholarships (deadline);
create index scholarships_college_idx on scholarships (college_id);
create index scholarships_scope_active_idx on scholarships (scope) where active;

create table profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  graduation_year int,
  gpa numeric(3,2),
  intended_major text,
  state text,
  high_school text,
  demographics jsonb,
  target_college_ids uuid[],
  updated_at timestamptz default now()
);

create table saved_scholarships (
  user_id uuid references auth.users (id) on delete cascade,
  scholarship_id uuid references scholarships (id) on delete cascade,
  status text default 'saved' check (status in ('saved','applied','rejected','awarded')),
  notes text,
  saved_at timestamptz default now(),
  primary key (user_id, scholarship_id)
);

create table match_cache (
  user_id uuid references auth.users (id) on delete cascade,
  scholarship_id uuid references scholarships (id) on delete cascade,
  score int not null check (score between 0 and 100),
  reason text not null,
  profile_hash text not null,
  created_at timestamptz default now(),
  primary key (user_id, scholarship_id)
);

-- RLS
alter table colleges enable row level security;
alter table scholarships enable row level security;
alter table profiles enable row level security;
alter table saved_scholarships enable row level security;
alter table match_cache enable row level security;

create policy "anyone reads colleges" on colleges for select using (true);
create policy "anyone reads active scholarships" on scholarships for select using (active);

create policy "users read own profile" on profiles for select using (auth.uid() = user_id);
create policy "users upsert own profile" on profiles for insert with check (auth.uid() = user_id);
create policy "users update own profile" on profiles for update using (auth.uid() = user_id);

create policy "users read own saved" on saved_scholarships for select using (auth.uid() = user_id);
create policy "users insert own saved" on saved_scholarships for insert with check (auth.uid() = user_id);
create policy "users update own saved" on saved_scholarships for update using (auth.uid() = user_id);
create policy "users delete own saved" on saved_scholarships for delete using (auth.uid() = user_id);

create policy "users read own match cache" on match_cache for select using (auth.uid() = user_id);
create policy "users write own match cache" on match_cache for insert with check (auth.uid() = user_id);
create policy "users delete own match cache" on match_cache for delete using (auth.uid() = user_id);

-- Helper RPC: scrapers send a payload with `college_slug` (text) instead of `college_id` (uuid).
-- This RPC resolves slugs to IDs and upserts on (source, external_id).
create or replace function upsert_scholarships_by_slug(payload jsonb)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  row jsonb;
  inserted int := 0;
  resolved_college_id uuid;
begin
  for row in select * from jsonb_array_elements(payload)
  loop
    resolved_college_id := null;
    if (row->>'college_slug') is not null then
      select id into resolved_college_id from colleges where slug = row->>'college_slug';
    end if;

    insert into scholarships (
      external_id, source, source_url, name, description,
      amount_min, amount_max, deadline, eligibility_text, scope,
      college_id, tags, last_scraped, active
    ) values (
      row->>'external_id',
      row->>'source',
      row->>'source_url',
      row->>'name',
      row->>'description',
      nullif(row->>'amount_min','')::numeric,
      nullif(row->>'amount_max','')::numeric,
      nullif(row->>'deadline','')::date,
      row->>'eligibility_text',
      row->>'scope',
      resolved_college_id,
      coalesce((select array_agg(value::text) from jsonb_array_elements_text(row->'tags')), '{}'),
      coalesce((row->>'last_scraped')::timestamptz, now()),
      coalesce((row->>'active')::boolean, true)
    )
    on conflict (source, external_id) do update set
      source_url = excluded.source_url,
      name = excluded.name,
      description = excluded.description,
      amount_min = excluded.amount_min,
      amount_max = excluded.amount_max,
      deadline = excluded.deadline,
      eligibility_text = excluded.eligibility_text,
      scope = excluded.scope,
      college_id = excluded.college_id,
      tags = excluded.tags,
      last_scraped = excluded.last_scraped,
      active = excluded.active;
    inserted := inserted + 1;
  end loop;
  return inserted;
end;
$$;
