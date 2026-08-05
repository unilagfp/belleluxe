import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database.types";

/**
 * Service-role client — bypasses RLS entirely. Server-only, never import from
 * a Client Component. Reserved for operations RLS can't express (e.g. one-off
 * admin bootstrapping); regular admin CRUD should go through the authenticated
 * client and rely on the is_admin() RLS policies instead.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
