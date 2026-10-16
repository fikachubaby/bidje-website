-- Fix: the opinions insert policy read auth.users directly, which the
-- authenticated role can't access (42501). Check verification through a
-- security definer function instead, so no user data is exposed.
-- Run in the Supabase SQL editor.

create or replace function auth_user_email_verified()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1 from auth.users
        where id = auth.uid() and email_confirmed_at is not null
    );
$$;

revoke all on function auth_user_email_verified() from public;
grant execute on function auth_user_email_verified() to authenticated;

drop policy if exists "opinions_insert_own" on property_opinions;
create policy "opinions_insert_own" on property_opinions
    for insert with check (auth.uid() = user_id and auth_user_email_verified());

-- Upsert also runs the update policy; require verification there too.
drop policy if exists "opinions_update_own" on property_opinions;
create policy "opinions_update_own" on property_opinions
    for update using (auth.uid() = user_id)
    with check (auth.uid() = user_id and auth_user_email_verified());
