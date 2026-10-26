-- New registrations must start as 'subscriber'; only an admin may change a role afterwards.
--
-- The profile row for a new auth user is created by a database trigger that isn't
-- tracked in this repo (the app never inserts into profiles), and it was producing
-- 'admin' roles. Rather than depend on that trigger, these guards on profiles
-- enforce the rule whichever trigger or client writes the row.

alter table public.profiles alter column role set default 'subscriber';

-- On insert: anything except the service role (server-side admin code) gets 'subscriber',
-- including the signup trigger and signup metadata a user could tamper with.
create or replace function public.profiles_force_default_role()
returns trigger
language plpgsql
as $$
begin
	if coalesce(auth.role(), '') <> 'service_role' then
		new.role := 'subscriber';
	end if;
	return new;
end;
$$;

drop trigger if exists profiles_force_default_role on public.profiles;
create trigger profiles_force_default_role
	before insert on public.profiles
	for each row execute function public.profiles_force_default_role();

-- On update: a role change is only allowed for admins, the service role, or direct
-- database access (no JWT, e.g. the SQL editor). Stops users promoting themselves.
create or replace function public.profiles_guard_role_change()
returns trigger
language plpgsql
as $$
begin
	if new.role is distinct from old.role
		and auth.role() is not null
		and auth.role() <> 'service_role'
		and not exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
	then
		raise exception 'Only an admin can change a user''s role' using errcode = '42501';
	end if;
	return new;
end;
$$;

drop trigger if exists profiles_guard_role_change on public.profiles;
create trigger profiles_guard_role_change
	before update on public.profiles
	for each row execute function public.profiles_guard_role_change();

-- Lets the admin notification bell react to new registrations in real time.
do $$
begin
	if not exists (
		select 1 from pg_publication_tables
		where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'profiles'
	) then
		alter publication supabase_realtime add table public.profiles;
	end if;
end;
$$;
