-- Reminders can go to extra people (lawyer, contractor, admin...) and repeat daily / weekly / monthly.
-- recipients:   [{ "role": "Lawyer", "name": "...", "phone": "...", "email": "..." }], max 5.
-- repeat_every: null keeps the old "N days before" behaviour (remind_days_before) for existing reminders.
-- Additive and safe on live data. Run in the Supabase SQL editor BEFORE deploying the code.
alter table reminders add column if not exists recipients jsonb not null default '[]'::jsonb;
alter table reminders add column if not exists repeat_every text check (repeat_every in ('day', 'week', 'month'));

-- Make the API see the new columns straight away.
notify pgrst, 'reload schema';
