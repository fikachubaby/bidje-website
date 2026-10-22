-- Link "List your property" requests to the signed-in seller so they can track the status.
-- Run in the Supabase SQL editor.

alter table property_requests
    add column if not exists user_id uuid references profiles(id) on delete set null;
create index if not exists property_requests_user_idx on property_requests(user_id, created_at desc);
