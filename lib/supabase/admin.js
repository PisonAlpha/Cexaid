import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client - bypasses Row Level Security entirely. Server-only,
// NEVER import this in a "use client" file or expose the key to the browser.
// Used inside API routes for every real write (creating projects/rounds,
// recording contributions, admin approvals).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
