import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      wallet,
      name,
      tagline,
      description,
      website,
      logoUrl,
      twitter,
      telegram,
      roundTagline,
      tokenSymbol,
      tokenPriceUSD,
      totalAllocationUSD,
      minTicketUSD,
      maxTicketUSD,
      startsAt,
      endsAt,
      vestingSchedule,
    } = body;

    if (!wallet) return NextResponse.json({ ok: false, error: "Connect a wallet first." }, { status: 400 });

    const supabaseCheck = createAdminClient();
    const { data: kyc } = await supabaseCheck
      .from("kyc_submissions")
      .select("status")
      .eq("wallet", wallet)
      .maybeSingle();
    if (!kyc || kyc.status !== "approved") {
      return NextResponse.json(
        { ok: false, error: "KYC approval is required before listing a project. Submit KYC first." },
        { status: 403 }
      );
    }

    if (!name || !tagline || !description) {
      return NextResponse.json(
        { ok: false, error: "Project name, tagline, and description are required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    let { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("founder_wallet", wallet)
      .maybeSingle();

    if (!project) {
      const slug = slugify(name);
      const { data: clash } = await supabase.from("projects").select("id").eq("slug", slug).maybeSingle();
      if (clash) {
        return NextResponse.json(
          { ok: false, error: "A project with a similar name already exists." },
          { status: 400 }
        );
      }

      const { data: created, error } = await supabase
        .from("projects")
        .insert({
          slug,
          name,
          tagline,
          description,
          website: website || "",
          logo_url: logoUrl || "",
          twitter: twitter || "",
          telegram: telegram || "",
          founder_wallet: wallet,
        })
        .select()
        .single();

      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      project = created;
    }

    const { data: existingRound } = await supabase
      .from("rounds")
      .select("id")
      .eq("project_id", project.id)
      .eq("type", "private")
      .maybeSingle();

    if (existingRound) {
      return NextResponse.json(
        { ok: false, error: "You already have a Private Sale round for this project." },
        { status: 400 }
      );
    }

    const { data: roundRow, error: roundError } = await supabase
      .from("rounds")
      .insert({
        project_id: project.id,
        slug: "private-sale",
        type: "private",
        round_number: 1,
        title: "Private Sale",
        tagline: roundTagline || "",
        token_symbol: tokenSymbol,
        token_price_usd: Number(tokenPriceUSD),
        total_allocation_usd: Number(totalAllocationUSD),
        raised_usd: 0,
        starts_at: startsAt,
        ends_at: endsAt,
        min_ticket_usd: Number(minTicketUSD),
        max_ticket_usd: Number(maxTicketUSD),
        requires_approval: true,
        approval_status: "pending_review",
        vesting_schedule: vestingSchedule,
      })
      .select()
      .single();

    if (roundError) return NextResponse.json({ ok: false, error: roundError.message }, { status: 500 });

    return NextResponse.json({ ok: true, projectId: project.id, slug: project.slug, roundId: roundRow.id });
  } catch (err) {
    console.error("private-sale route error:", err);
    return NextResponse.json({ ok: false, error: "Unexpected server error. Check server logs." }, { status: 500 });
  }
}
