import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/requireAdmin";

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Lets CEXAID staff create a Private Sale listing directly, fully approved
// immediately - for projects CEXAID sources and onboards itself, bypassing
// the public founder self-serve flow (which still exists separately).
export async function POST(request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });

  const body = await request.json();
  const {
    name,
    tagline,
    description,
    website,
    logoUrl,
    twitter,
    telegram,
    founderWallet,
    tokenSymbol,
    tokenPriceUSD,
    totalAllocationUSD,
    raisedUSD,
    minTicketUSD,
    maxTicketUSD,
    startsAt,
    endsAt,
    chain,
    vestingSchedule,
  } = body;

  if (!name || !tagline || !description || !founderWallet) {
    return NextResponse.json(
      { ok: false, error: "Project name, tagline, description, and founder wallet are required." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const slug = slugify(name);

  const { data: clash } = await supabase.from("projects").select("id").eq("slug", slug).maybeSingle();
  if (clash) {
    return NextResponse.json({ ok: false, error: "A project with a similar name already exists." }, { status: 400 });
  }

  const { data: project, error: projectError } = await supabase
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
      founder_wallet: founderWallet,
      is_demo: false,
    })
    .select()
    .single();

  if (projectError) return NextResponse.json({ ok: false, error: projectError.message }, { status: 500 });

  const { data: round, error: roundError } = await supabase
    .from("rounds")
    .insert({
      project_id: project.id,
      slug: "private-sale",
      type: "private",
      round_number: 1,
      title: "Private Sale",
      tagline: "Reserved for CEXAID-approved investors.",
      token_symbol: tokenSymbol,
      token_price_usd: Number(tokenPriceUSD),
      total_allocation_usd: Number(totalAllocationUSD),
      raised_usd: Number(raisedUSD) || 0,
      starts_at: startsAt,
      ends_at: endsAt,
      min_ticket_usd: Number(minTicketUSD),
      max_ticket_usd: Number(maxTicketUSD),
      requires_approval: true,
      approval_status: "approved", // admin-created listings go live immediately
      chain: chain || "BNB Chain",
      vesting_schedule: vestingSchedule,
    })
    .select()
    .single();

  if (roundError) return NextResponse.json({ ok: false, error: roundError.message }, { status: 500 });

  return NextResponse.json({ ok: true, projectId: project.id, slug: project.slug, roundId: round.id });
}
