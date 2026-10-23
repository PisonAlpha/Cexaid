import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { publicClient } from "@/lib/launchpad/saleServer";
import { ERC20_ABI } from "@/lib/launchpad/saleAbi";
import { monthlySteps, usdToWei } from "@/lib/launchpad/units";

export const maxDuration = 30;

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
      tokenContract,
      tgeAt,
      tgePercent,
      cliffMonths,
      linearMonths,
    } = body;

    const tokenAddr = (tokenContract || "").trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddr)) {
      return NextResponse.json(
        { ok: false, error: "Your token must already be created. Enter its contract address (0x…, 42 characters)." },
        { status: 400 }
      );
    }
    // Logo is optional: a small PNG/JPG/WebP picture (sent as a data URL, already shrunk in the
    // browser) or an https link. Anything else is refused.
    let logo = "";
    if (logoUrl) {
      const v = String(logoUrl).trim();
      const okData = v.length <= 170000 && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v);
      const okUrl = v.length <= 500 && /^https:\/\/[^\s"'<>]+$/i.test(v);
      if (!okData && !okUrl) {
        return NextResponse.json(
          { ok: false, error: "The logo must be a PNG, JPG or WebP image. Please upload it again." },
          { status: 400 }
        );
      }
      logo = v;
    }
    const tgePct = Number(tgePercent);
    const cliffM = Math.floor(Number(cliffMonths));
    const linearM = Math.floor(Number(linearMonths));
    if (!(tgePct >= 0 && tgePct <= 100) || !(cliffM >= 0 && cliffM <= 48) || !(linearM >= 0 && linearM <= 60) || (tgePct < 100 && linearM < 1)) {
      return NextResponse.json(
        { ok: false, error: "Vesting terms are invalid: TGE unlock 0-100%, cliff 0-48 months, and a linear period of at least 1 month unless 100% unlocks at TGE." },
        { status: 400 }
      );
    }
    const tgeMs = new Date(tgeAt).getTime();
    const endMs = new Date(body.endsAt).getTime();
    const startMs = new Date(startsAt).getTime();
    if (!startMs || !endMs || endMs <= startMs) {
      return NextResponse.json({ ok: false, error: "The sale end must be after the sale start." }, { status: 400 });
    }
    if (!tgeMs || !endMs || tgeMs < endMs || tgeMs > endMs + 180 * 86400000) {
      return NextResponse.json(
        { ok: false, error: "The token claim (TGE) date must be on or after the sale end date, and no more than 180 days after it." },
        { status: 400 }
      );
    }

    // The token must really exist on-chain, match the symbol, and be big enough to cover the sale.
    try {
      const code = await publicClient.getCode({ address: tokenAddr });
      if (!code || code === "0x") throw new Error("no contract");
      const rd = (functionName) => publicClient.readContract({ address: tokenAddr, abi: ERC20_ABI, functionName });
      const [symbol, decimals, supply] = await Promise.all([rd("symbol"), rd("decimals"), rd("totalSupply")]);
      if (String(symbol).toUpperCase() !== String(tokenSymbol || "").toUpperCase()) {
        return NextResponse.json({ ok: false, error: `Token symbol mismatch: the contract says ${symbol}, you entered ${tokenSymbol}.` }, { status: 400 });
      }
      const needed = (usdToWei(totalAllocationUSD) * 10n ** BigInt(decimals)) / usdToWei(tokenPriceUSD);
      if (supply < needed) {
        return NextResponse.json({ ok: false, error: "The token's total supply is smaller than the amount this sale needs to deliver." }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ ok: false, error: "Could not read that token on BNB Chain. Check the contract address." }, { status: 400 });
    }

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
          logo_url: logo,
          twitter: twitter || "",
          telegram: telegram || "",
          contract_address: tokenAddr || null,
          founder_wallet: wallet,
        })
        .select()
        .single();

      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      project = created;
    }

    if (tokenAddr && !project.contract_address) {
      await supabase.from("projects").update({ contract_address: tokenAddr }).eq("id", project.id);
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
        starts_at: new Date(startMs).toISOString(),
        ends_at: new Date(endMs).toISOString(),
        min_ticket_usd: Number(minTicketUSD),
        max_ticket_usd: Number(maxTicketUSD),
        requires_approval: true,
        approval_status: "pending_review",
        vesting_schedule: monthlySteps(tgePct, cliffM, linearM),
        tge_date: new Date(tgeMs).toISOString(),
        vest_tge_percent: tgePct,
        vest_cliff_months: cliffM,
        vest_linear_months: linearM,
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
