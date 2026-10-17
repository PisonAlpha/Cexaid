-- Run once in the Supabase SQL editor. Stores the on-chain vesting terms a founder
-- chooses for a private sale (tge_date already exists from migration-market-links.sql).
alter table rounds add column if not exists tge_date timestamptz;
alter table rounds add column if not exists vest_tge_percent numeric;
alter table rounds add column if not exists vest_cliff_months integer;
alter table rounds add column if not exists vest_linear_months integer;
