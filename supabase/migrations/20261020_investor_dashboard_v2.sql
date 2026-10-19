-- Investor dashboard v2: agent fee, contractor, phase timeframes, expense receipts, new sales steps.
-- Run in the Supabase SQL editor after 20261018_investor_consultants.sql.

alter table investor_properties add column if not exists agent_fee numeric default 0;

-- Renovation contractor.
alter table investor_properties add column if not exists contractor_name text;
alter table investor_properties add column if not exists contractor_phone text;

-- Planned timeframe for each phase.
alter table investor_properties add column if not exists legal_start date;
alter table investor_properties add column if not exists legal_end date;
alter table investor_properties add column if not exists renovation_start date;
alter table investor_properties add column if not exists renovation_end date;
alter table investor_properties add column if not exists sales_start date;
alter table investor_properties add column if not exists sales_end date;

-- Expenses an investor records with a receipt; the amount is added to the matching cost straight away.
create table if not exists investor_expenses (
    id uuid primary key default gen_random_uuid(),
    investor_property_id uuid not null references investor_properties(id) on delete cascade,
    category text not null check (category in ('legal','agent','renovation')),
    amount numeric not null check (amount > 0),
    note text,
    receipt_path text,                       -- path inside the investor-documents bucket
    receipt_name text,
    created_by uuid references profiles(id) on delete set null,
    created_at timestamptz not null default now()
);
create index if not exists investor_expenses_property_idx on investor_expenses(investor_property_id, created_at desc);
alter table investor_expenses enable row level security;

-- Replace the old sales checklist with the new 9 steps, carrying over progress.
-- Safe to re-run: properties that already have the new steps are left untouched.
-- One statement (no temp table): the SQL editor may run each statement on a different connection.
with old_sales as (
    select investor_property_id,
           bool_or(done and label = 'Sale completed') as completed,
           max(done_at) filter (where done and label = 'Sale completed') as completed_at,
           bool_or(done and label = 'Buyer SPA signed') as spa_signed,
           max(done_at) filter (where done and label = 'Buyer SPA signed') as spa_at,
           bool_or(done and label = 'Offer accepted') as booked,
           max(done_at) filter (where done and label = 'Offer accepted') as booked_at
    from investor_property_milestones
    where category = 'sales'
      and label in ('Listed on Bidje','Buyer viewings started','Offer received','Offer accepted','Buyer SPA signed','Sale completed')
    group by investor_property_id
),
removed as (
    delete from investor_property_milestones
    where category = 'sales'
      and label in ('Listed on Bidje','Buyer viewings started','Offer received','Offer accepted','Buyer SPA signed','Sale completed')
    returning id
)
insert into investor_property_milestones (investor_property_id, category, label, sort_order, done, done_at)
select p.id, 'sales', s.label, s.ord - 1,
       coalesce(o.completed or (s.ord <= 2 and o.spa_signed) or (s.ord = 1 and o.booked), false),
       case
           when o.completed then coalesce(o.completed_at, now())
           when s.ord <= 2 and o.spa_signed then coalesce(o.spa_at, now())
           when s.ord = 1 and o.booked then coalesce(o.booked_at, now())
       end
from investor_properties p
cross join unnest(array[
    'Buyer booked',
    'SPA signed',
    'Loan agreement signed',
    'Consent approval',
    'First disbursement',
    'Release title',
    'Discharge documents',
    'Transfer / charge perfected',
    'Second disbursement'
]) with ordinality as s(label, ord)
left join old_sales o on o.investor_property_id = p.id
where not exists (
    select 1 from investor_property_milestones m
    where m.investor_property_id = p.id and m.category = 'sales' and m.label = 'Buyer booked'
);

-- Make the new columns visible to the API immediately.
notify pgrst, 'reload schema';
