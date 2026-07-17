import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side client for use in Server Components / route handlers that
// need to know WHO is logged in (e.g. checking the admin session). Still
// subject to RLS - use admin.js instead for privileged writes.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component - safe to ignore, middleware
            // handles session refresh instead.
          }
        },
      },
    }
  );
}
