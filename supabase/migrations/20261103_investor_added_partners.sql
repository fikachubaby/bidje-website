-- Investors can pick a Bidje partner firm or add their own ("Other").
-- Rows with added_by = null are Bidje's official partners; rows with added_by set
-- were keyed in by that investor and are only offered back to them.
-- Run in the Supabase SQL editor.
alter table legal_firms add column if not exists added_by uuid references profiles(id) on delete set null;
alter table financing_consultants add column if not exists added_by uuid references profiles(id) on delete set null;

create index if not exists legal_firms_added_by_idx on legal_firms(added_by);
create index if not exists financing_consultants_added_by_idx on financing_consultants(added_by);
