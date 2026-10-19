-- Financing eligibility screening for purchasers using bank financing (Loan).
-- Run in the Supabase SQL editor.
--
-- Contains sensitive financial documents, so:
--   * files live in a PRIVATE bucket and are only read via short-lived signed URLs from staff routes,
--   * owners can read their own rows; all writes go through service-role API routes,
--   * documents are purged after a decision (see /api/cron/financing-screening-purge).

create table if not exists financing_screenings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    applicant_type text not null check (applicant_type in ('government_servant', 'salaried', 'self_employed', 'company')),
    company_kind text check (company_kind in ('sdn_bhd', 'enterprise')),
    status text not null default 'awaiting_documents' check (status in (
        'awaiting_documents', 'payment_pending', 'under_review',
        'additional_documents_required', 'eligible', 'not_eligible'
    )),
    fee_amount numeric not null,
    fee_paid_at timestamptz,
    payment_id uuid references payments(id),
    consent_at timestamptz,
    consent_ip text,
    consent_version text,
    staff_remark text,
    reviewed_by uuid references auth.users(id),
    reviewed_at timestamptz,
    valid_until timestamptz,
    documents_purge_after timestamptz,
    documents_purged_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists financing_screenings_user_idx on financing_screenings(user_id, created_at desc);
create index if not exists financing_screenings_status_idx on financing_screenings(status, created_at desc);

create table if not exists financing_screening_documents (
    id uuid primary key default gen_random_uuid(),
    screening_id uuid not null references financing_screenings(id) on delete cascade,
    doc_key text not null,
    file_path text not null,
    file_name text not null,
    mime_type text,
    size_bytes int,
    created_at timestamptz not null default now()
);

create index if not exists financing_screening_documents_screening_idx on financing_screening_documents(screening_id);

alter table financing_screenings enable row level security;
alter table financing_screening_documents enable row level security;

drop policy if exists "owner reads screenings" on financing_screenings;
create policy "owner reads screenings" on financing_screenings
    for select using (auth.uid() = user_id);

drop policy if exists "owner reads screening documents" on financing_screening_documents;
create policy "owner reads screening documents" on financing_screening_documents
    for select using (exists (
        select 1 from financing_screenings s where s.id = screening_id and s.user_id = auth.uid()
    ));

-- Private bucket: no storage policies, so only the service role can read/write.
insert into storage.buckets (id, name, public)
values ('financing-documents', 'financing-documents', false)
on conflict (id) do update set public = false;

-- Offers made with a loan must reference a valid, eligible screening.
alter table offers add column if not exists financing_screening_id uuid references financing_screenings(id);

create or replace function require_financing_screening()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    screening_id uuid;
begin
    if new.purchase_method is distinct from 'Loan' then
        return new;
    end if;

    select id into screening_id
    from financing_screenings
    where user_id = new.user_id
      and status = 'eligible'
      and (valid_until is null or valid_until > now())
    order by reviewed_at desc nulls last
    limit 1;

    if screening_id is null then
        raise exception 'Financing screening required';
    end if;

    new.financing_screening_id := screening_id;
    return new;
end;
$$;

drop trigger if exists offers_require_financing_screening on offers;
create trigger offers_require_financing_screening
    before insert on offers
    for each row execute function require_financing_screening();
