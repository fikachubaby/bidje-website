-- Transaction details for investor properties (admin "Transaction Details" + investor dashboard).
-- selling_price: the actual agreed sale price (target_price stays as the asking/target price).
-- details: free-text contact/title info (lot no, mukim, PICs, purchaser, loan lawyer...).
--          Keys are whitelisted in src/lib/investor.ts (TRANSACTION_DETAIL_KEYS).
-- Additive and safe to run on live data. Run in the Supabase SQL editor BEFORE deploying the code.
alter table investor_properties add column if not exists selling_price numeric not null default 0;
alter table investor_properties add column if not exists details jsonb not null default '{}'::jsonb;

-- Documents Bidje uploads for an investor (SPA, title, reports...). Kept apart from investor_documents,
-- which holds investor statements that go through AI extraction + admin review.
-- Files live in the existing private "investor-documents" bucket under <property id>/shared/.
create table if not exists investor_shared_documents (
    id uuid primary key default gen_random_uuid(),
    investor_property_id uuid not null references investor_properties(id) on delete cascade,
    uploaded_by uuid references profiles(id) on delete set null,
    file_path text not null,
    file_name text not null,
    mime_type text not null,
    created_at timestamptz not null default now()
);
create index if not exists investor_shared_documents_property_idx
    on investor_shared_documents(investor_property_id, created_at desc);
-- Only read server-side with the service role.
alter table investor_shared_documents enable row level security;

-- Make the API see the new columns straight away.
notify pgrst, 'reload schema';
