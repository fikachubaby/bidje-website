-- Link investor properties to the registered legal firm and financing consultant.
-- Run in the Supabase SQL editor.
alter table investor_properties add column if not exists legal_firm_id uuid references legal_firms(id) on delete set null;
alter table investor_properties add column if not exists financing_consultant_id uuid references financing_consultants(id) on delete set null;
