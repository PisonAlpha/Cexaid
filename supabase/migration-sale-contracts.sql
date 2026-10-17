-- Run once in the Supabase SQL editor. Links each private-sale round to its
-- on-chain contract (created from Admin -> Deploy contract).
alter table rounds add column if not exists contract_address text;
alter table rounds add column if not exists chain_id integer;
create unique index if not exists rounds_contract_address_key on rounds (lower(contract_address)) where contract_address is not null;
