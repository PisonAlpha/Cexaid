-- Run once in the Supabase SQL editor. Market-wide token unlock calendar
-- (events you add from Admin -> Token unlocks).
create table if not exists token_unlocks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  symbol text not null,
  coingecko_id text,
  logo_url text,
  unlock_date timestamptz not null,
  tokens numeric,
  percent_of_supply numeric,
  category text,
  note text,
  created_at timestamptz not null default now()
);
alter table token_unlocks enable row level security;
drop policy if exists "public read token_unlocks" on token_unlocks;
create policy "public read token_unlocks" on token_unlocks for select using (true);
