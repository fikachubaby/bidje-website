-- Remarks on uploaded documents (e.g. IC, Owner, SPA) and a date on expenses.
-- Additive and safe on live data. Run in the Supabase SQL editor BEFORE deploying the code.
alter table investor_shared_documents add column if not exists remark text;
alter table investor_documents add column if not exists remark text;
alter table investor_expenses add column if not exists expense_date date;

-- Make the API see the new columns straight away.
notify pgrst, 'reload schema';
