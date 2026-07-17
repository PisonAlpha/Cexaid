"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser-side client. Uses the public anon key, subject to Row Level
// Security - can only read public tables (projects, rounds, contributions),
// cannot write anything and cannot read investor_applications directly.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
