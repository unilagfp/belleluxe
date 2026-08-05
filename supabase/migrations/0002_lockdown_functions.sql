-- Lock down internal functions that Postgres/PostgREST expose by default.

-- handle_new_user is a trigger function only — trigger firing isn't gated by EXECUTE
-- grants, so revoking direct callability here is safe and just removes it from the
-- exposed RPC surface (calling a `returns trigger` function directly errors anyway).
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- is_admin() only ever needs to read the CALLER's own profiles row (auth.uid() = id),
-- which the "profiles_select" policy already permits for every user regardless of
-- security context. So it doesn't need SECURITY DEFINER at all — switching it to the
-- default SECURITY INVOKER removes the "security-definer callable by anon" advisory
-- without touching EXECUTE grants (which every RLS policy referencing is_admin() needs
-- anon/authenticated to keep, or the storefront breaks entirely).
create or replace function public.is_admin()
returns boolean
language sql
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- create_order stays SECURITY DEFINER + anon/authenticated executable: that's the
-- intended guest-checkout path (it re-validates prices/stock server-side).

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
