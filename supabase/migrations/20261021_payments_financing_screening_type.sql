-- Allow financing screening fees in payments.
-- Run in the Supabase SQL editor.
--
-- The new list keeps every type already in the table, so this can't fail on old rows.
do $$
declare
    allowed text;
begin
    select string_agg(quote_literal(t), ', ')
    into allowed
    from (
        select unnest(array['offer_fee', 'subscription', 'financing_screening']) as t
        union
        select distinct type from payments where type is not null
    ) types;

    alter table payments drop constraint if exists payments_type_check;
    execute format('alter table payments add constraint payments_type_check check (type in (%s))', allowed);
end;
$$;
