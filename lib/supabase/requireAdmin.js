import { createClient } from "./server";

// Checks the logged-in Supabase user against ADMIN_EMAIL. Only that one
// account can ever pass this check - anyone else with a Supabase login
// (there shouldn't be any others, since you create accounts manually in
// the Supabase dashboard) gets rejected even if somehow authenticated.
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return { ok: false };
  }
  return { ok: true, user };
}
