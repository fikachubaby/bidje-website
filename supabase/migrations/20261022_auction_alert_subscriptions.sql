-- WhatsApp auction alert consent/subscription records.
-- Managed through authenticated server routes using the Supabase service role.

create table if not exists auction_alert_subscriptions (
    user_id uuid primary key references auth.users(id) on delete cascade,
    phone text,
    opted_in boolean not null default false,
    consent_text_version text not null default '2026-10-22-v1',
    consent_source text not null default 'profile',
    opted_in_at timestamptz,
    opted_out_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    check (phone is null or phone ~ '^\\+[1-9][0-9]{7,14}$'),
    check (not opted_in or phone is not null)
);

create index if not exists auction_alert_subscriptions_opted_in_idx
    on auction_alert_subscriptions (opted_in, updated_at desc);

alter table auction_alert_subscriptions enable row level security;
