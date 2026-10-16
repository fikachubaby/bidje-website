-- AI progress monitoring + investor bank statement uploads.
-- Run in the Supabase SQL editor after 20261016_investor_portfolio.sql.

-- Latest AI blocker analysis per investor property.
alter table investor_properties add column if not exists ai_analysis jsonb;
alter table investor_properties add column if not exists ai_analyzed_at timestamptz;

-- Documents investors upload (bank statements, receipts, legal letters).
create table if not exists investor_documents (
    id uuid primary key default gen_random_uuid(),
    investor_property_id uuid not null references investor_properties(id) on delete cascade,
    uploaded_by uuid references profiles(id) on delete set null,
    file_path text not null,                 -- path inside the investor-documents bucket
    file_name text not null,
    mime_type text not null,
    status text not null default 'processing'
        check (status in ('processing','pending_review','approved','rejected','failed')),
    ai_summary text,
    error text,
    reviewed_by uuid references profiles(id) on delete set null,
    reviewed_at timestamptz,
    created_at timestamptz not null default now()
);
create index if not exists investor_documents_property_idx on investor_documents(investor_property_id, created_at desc);

-- Transactions the AI pulled out of a document; admin approves before they hit the property's costs.
create table if not exists investor_document_transactions (
    id uuid primary key default gen_random_uuid(),
    document_id uuid not null references investor_documents(id) on delete cascade,
    txn_date date,
    description text not null,
    amount numeric not null,
    category text not null check (category in ('purchase','legal','renovation','other','unrelated')),
    confidence numeric,
    included boolean not null default true    -- admin can untick a line before approving
);
create index if not exists idt_document_idx on investor_document_transactions(document_id);

alter table investor_documents enable row level security;
alter table investor_document_transactions enable row level security;

-- Private bucket; files are only read server-side with the service role.
insert into storage.buckets (id, name, public)
values ('investor-documents', 'investor-documents', false)
on conflict (id) do nothing;
