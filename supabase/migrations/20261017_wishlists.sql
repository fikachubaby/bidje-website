-- Wishlist: properties a signed-in user has favourited.
-- Run in the Supabase SQL editor.

create table if not exists wishlists (
    user_id uuid not null references profiles(id) on delete cascade,
    property_id uuid not null references properties(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (user_id, property_id)
);
create index if not exists wishlists_user_idx on wishlists(user_id, created_at desc);

-- Users manage only their own rows, straight from the browser client.
alter table wishlists enable row level security;

drop policy if exists "wishlists_select_own" on wishlists;
create policy "wishlists_select_own" on wishlists
    for select using (auth.uid() = user_id);

drop policy if exists "wishlists_insert_own" on wishlists;
create policy "wishlists_insert_own" on wishlists
    for insert with check (auth.uid() = user_id);

drop policy if exists "wishlists_delete_own" on wishlists;
create policy "wishlists_delete_own" on wishlists
    for delete using (auth.uid() = user_id);
