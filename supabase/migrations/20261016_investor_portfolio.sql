-- Investor portfolio: role, properties, milestones, updates, reminders link.
-- Run in the Supabase SQL editor.

insert into roles (name, description)
select 'investor', 'Investor with a managed property portfolio'
where not exists (select 1 from roles where name = 'investor');

create table if not exists investor_properties (
    id uuid primary key default gen_random_uuid(),
    investor_id uuid not null references profiles(id) on delete cascade,
    property_id uuid references properties(id) on delete set null,
    ref_no text,
    address text not null,
    state text,
    date_signed date,
    date_signed_note text,              -- raw value when not a full date, e.g. "2024" or "?"
    stage text not null default 'legal' check (stage in ('legal','renovation','for_sale','sold','completed')),
    purchase_price numeric default 0,
    legal_cost numeric default 0,
    renovation_cost numeric default 0,
    other_cost numeric default 0,
    selling_cost numeric default 0,
    target_price numeric default 0,
    highest_offer numeric default 0,
    expected_completion date,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index if not exists investor_properties_investor_idx on investor_properties(investor_id);

create table if not exists investor_property_milestones (
    id uuid primary key default gen_random_uuid(),
    investor_property_id uuid not null references investor_properties(id) on delete cascade,
    category text not null check (category in ('legal','renovation','sales')),
    label text not null,
    sort_order int not null default 0,
    done boolean not null default false,
    done_at timestamptz
);
create index if not exists ipm_property_idx on investor_property_milestones(investor_property_id);

create table if not exists investor_property_updates (
    id uuid primary key default gen_random_uuid(),
    investor_property_id uuid not null references investor_properties(id) on delete cascade,
    category text not null check (category in ('legal','renovation','sales','finance','general')),
    message text not null,
    visible_to_investor boolean not null default true,
    created_by uuid references profiles(id) on delete set null,
    created_at timestamptz not null default now()
);
create index if not exists ipu_property_idx on investor_property_updates(investor_property_id);

-- Reminders can now target an investor property instead of a listing.
alter table reminders add column if not exists investor_property_id uuid references investor_properties(id) on delete cascade;
alter table reminders alter column property_id drop not null;

-- All access goes through server routes using the service role.
alter table investor_properties enable row level security;
alter table investor_property_milestones enable row level security;
alter table investor_property_updates enable row level security;
