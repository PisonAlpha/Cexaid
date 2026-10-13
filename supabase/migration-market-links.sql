-- Run once in the Supabase SQL editor. Adds the fields that connect a CEXAID
-- project to live market data and powers the Unlock Calendar.
alter table projects add column if not exists coingecko_id text;
alter table projects add column if not exists contract_address text;
alter table rounds add column if not exists tge_date timestamptz;

-- Also fixes the latent mismatch: the investor rejection reason column.
alter table investor_applications add column if not exists rejection_reason text;
