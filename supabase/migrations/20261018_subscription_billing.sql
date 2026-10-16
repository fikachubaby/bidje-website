-- Subscriber billing: monthly plan via Fiuu with auto-renewal.
-- Run in the Supabase SQL editor.

-- One subscription row per user; renewals extend it instead of inserting new rows.
alter table subscriptions add column if not exists plan text not null default 'monthly';
alter table subscriptions add column if not exists price numeric not null default 2;
alter table subscriptions add column if not exists current_period_start timestamptz;
alter table subscriptions add column if not exists payment_token text;          -- Fiuu card token for auto-renew
alter table subscriptions add column if not exists card_label text;             -- e.g. "VISA •••• 4242"
alter table subscriptions add column if not exists cancel_at_period_end boolean not null default false;
alter table subscriptions add column if not exists renewal_failures int not null default 0;
alter table subscriptions add column if not exists next_retry_at timestamptz;
alter table subscriptions add column if not exists updated_at timestamptz not null default now();
alter table subscriptions alter column auto_renew set default true;

create unique index if not exists subscriptions_user_unique on subscriptions(user_id);

-- Allow subscription payments alongside offer fees.
alter table payments add column if not exists created_at timestamptz not null default now();
create index if not exists payments_user_type_idx on payments(user_id, type, created_at desc);

-- Statuses used by the app: active, past_due (renewal failed, in grace), expired, cancelled.
