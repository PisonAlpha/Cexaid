import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/requireAdmin";

// Returns rounds awaiting CEXAID review (private sale submissions), joined
// with their project name so the admin dashboard has context.
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("rounds")
    .select("*, projects(name, slug, founder_wallet)")
    .eq("type", "private")
    .eq("approval_status", "pending_review")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, rounds: data });
}
