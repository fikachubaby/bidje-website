-- Bidje rating: a computed deal score plus live buyer sentiment.
-- Run in the Supabase SQL editor.

-- 1. Inputs and output of the computed score.
alter table properties add column if not exists monthly_rent numeric;
alter table properties add column if not exists bidje_score_breakdown jsonb;
alter table properties add column if not exists bidje_score_updated_at timestamptz;

-- 2. One free price opinion per signed-in user per property.
create table if not exists property_opinions (
    user_id uuid not null references profiles(id) on delete cascade,
    property_id uuid not null references properties(id) on delete cascade,
    opinion text not null check (opinion in ('bargain', 'fair', 'too_high')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (user_id, property_id)
);
create index if not exists property_opinions_property_idx on property_opinions(property_id);

alter table property_opinions enable row level security;

drop policy if exists "opinions_select_own" on property_opinions;
create policy "opinions_select_own" on property_opinions
    for select using (auth.uid() = user_id);

-- Only verified (email-confirmed) users may vote.
drop policy if exists "opinions_insert_own" on property_opinions;
create policy "opinions_insert_own" on property_opinions
    for insert with check (auth.uid() = user_id);
-- Email-verification check is added in 20261019_bidje_rating_fix_policy.sql.

drop policy if exists "opinions_update_own" on property_opinions;
create policy "opinions_update_own" on property_opinions
    for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "opinions_delete_own" on property_opinions;
create policy "opinions_delete_own" on property_opinions
    for delete using (auth.uid() = user_id);

-- 3. Public, aggregate-only sentiment per property. Individual offers and
--    opinions stay private; only these totals are readable by anyone.
create table if not exists property_sentiment (
    property_id uuid primary key references properties(id) on delete cascade,
    paid_offer_count int not null default 0,
    median_offer_ratio numeric,          -- median paid offer / asking price
    bargain_count int not null default 0,
    fair_count int not null default 0,
    too_high_count int not null default 0,
    updated_at timestamptz not null default now()
);

alter table property_sentiment enable row level security;

drop policy if exists "sentiment_public_read" on property_sentiment;
create policy "sentiment_public_read" on property_sentiment
    for select using (true);

create or replace function refresh_property_sentiment(p_property_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    if p_property_id is null then
        return;
    end if;

    insert into property_sentiment as s (
        property_id, paid_offer_count, median_offer_ratio,
        bargain_count, fair_count, too_high_count, updated_at
    )
    select
        p.id,
        coalesce(o.cnt, 0),
        o.median_ratio,
        coalesce(v.bargain, 0),
        coalesce(v.fair, 0),
        coalesce(v.too_high, 0),
        now()
    from properties p
    left join lateral (
        select
            count(*)::int as cnt,
            percentile_cont(0.5) within group (order by offers.offer_price / nullif(p.asking_price, 0)) as median_ratio
        from offers
        where offers.property_id = p.id and offers.payment_status = 'Paid'
    ) o on true
    left join lateral (
        select
            count(*) filter (where opinion = 'bargain')::int as bargain,
            count(*) filter (where opinion = 'fair')::int as fair,
            count(*) filter (where opinion = 'too_high')::int as too_high
        from property_opinions
        where property_opinions.property_id = p.id
    ) v on true
    where p.id = p_property_id
    on conflict (property_id) do update set
        paid_offer_count = excluded.paid_offer_count,
        median_offer_ratio = excluded.median_offer_ratio,
        bargain_count = excluded.bargain_count,
        fair_count = excluded.fair_count,
        too_high_count = excluded.too_high_count,
        updated_at = excluded.updated_at;
end;
$$;

create or replace function trg_refresh_property_sentiment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if tg_op in ('UPDATE', 'DELETE') then
        perform refresh_property_sentiment(old.property_id);
    end if;
    if tg_op in ('INSERT', 'UPDATE') and (tg_op = 'INSERT' or new.property_id is distinct from old.property_id) then
        perform refresh_property_sentiment(new.property_id);
    end if;
    return null;
end;
$$;

drop trigger if exists offers_refresh_sentiment on offers;
create trigger offers_refresh_sentiment
    after insert or update of payment_status, offer_price, property_id or delete on offers
    for each row execute function trg_refresh_property_sentiment();

drop trigger if exists opinions_refresh_sentiment on property_opinions;
create trigger opinions_refresh_sentiment
    after insert or update or delete on property_opinions
    for each row execute function trg_refresh_property_sentiment();

-- Backfill existing properties.
select refresh_property_sentiment(id) from properties;

-- 4. Stream sentiment changes to the property page.
do $$
begin
    alter publication supabase_realtime add table property_sentiment;
exception when duplicate_object then null;
end $$;
