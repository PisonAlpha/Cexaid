import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/requireAdmin";

export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });

  const { id } = await params;
  const { status, rejectionReason } = await request.json();
  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ ok: false, error: "Invalid status." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("kyc_submissions")
    .update({
      status,
      rejection_reason: status === "rejected" ? rejectionReason || "Not specified" : null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
