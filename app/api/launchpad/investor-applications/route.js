import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  const supabaseSession = await createClient();
  const {
    data: { user },
  } = await supabaseSession.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Please sign up or log in with your investor account first." },
      { status: 401 }
    );
  }

  const { name, organization, note, socialHandle } = await request.json();

  if (!name) {
    return NextResponse.json({ ok: false, error: "Name is required." }, { status: 400 });
  }
  if (!socialHandle || !socialHandle.trim()) {
    return NextResponse.json(
      { ok: false, error: "An X (Twitter) or LinkedIn profile link is required." },
      { status: 400 }
    );
  }
  const looksValid = /twitter\.com|x\.com|linkedin\.com/i.test(socialHandle);
  if (!looksValid) {
    return NextResponse.json(
      { ok: false, error: "Please provide a real X (Twitter) or LinkedIn profile URL." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("investor_applications")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ ok: false, error: "You already have an application on file." }, { status: 400 });
  }

  const { error } = await supabase.from("investor_applications").insert({
    user_id: user.id,
    email: user.email,
    name,
    organization: organization || "",
    note: note || "",
    social_handle: socialHandle,
  });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

// Checks the CURRENT LOGGED-IN investor's own status - determined from
// their session, never from a client-supplied identifier.
export async function GET() {
  const supabaseSession = await createClient();
  const {
    data: { user },
  } = await supabaseSession.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: true, status: "none" });
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("investor_applications")
    .select("status, rejection_reason")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({
    ok: true,
    status: data?.status ?? "none",
    rejectionReason: data?.rejection_reason ?? null,
  });
}
