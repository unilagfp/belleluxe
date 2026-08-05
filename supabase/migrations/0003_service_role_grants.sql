-- service_role (used by admin scripts/server-only code) needs explicit table
-- grants too — RLS bypass doesn't imply grant, and the default privilege setup
-- didn't cover it for these tables.
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
