import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SALE_FACTORY_ADDRESS } from "@/lib/launchpad/chain";
import { buildRoundTerms, signRoundApproval } from "@/lib/launchpad/saleServer";

// Gives the founder CEXAID's signed approval to deploy THIS approved round.
// The signature covers the founder wallet and every term, and the factory only
// accepts it from that founder wallet, so it is useless to anyone else and
// useless for any other terms. It expires, and works once.
export async function POST(request) {
  try {
    const { roundId } = await request.json();
    if (!roundId) return NextResponse.json({ ok: false, error: "roundId is required." }, { status: 400 });
    if (!SALE_FACTORY_ADDRESS) return NextResponse.json({ ok: false, error: "The sale factory is not configured." }, { status: 500 });

    const supabase = createAdminClient();
    const { data: round } = await supabase.from("rounds").select("*").eq("id", roundId).single();
    if (!round) return NextResponse.json({ ok: false, error: "Round not found." }, { status: 404 });
    if (round.approval_status !== "approved") {
      return NextResponse.json({ ok: false, error: "CEXAID has not approved this round yet." }, { status: 403 });
    }
    if (round.contract_address) {
      return NextResponse.json({ ok: false, error: "This round already has a sale contract." }, { status: 400 });
    }
    if (new Date(round.ends_at) < new Date()) {
      return NextResponse.json({ ok: false, error: "This round's end date has passed." }, { status: 400 });
    }

    const { data: project } = await supabase.from("projects").select("slug, contract_address, founder_wallet, is_demo").eq("id", round.project_id).single();
    if (project?.is_demo) return NextResponse.json({ ok: false, error: "Demo listings cannot deploy a contract." }, { status: 400 });

    let built;
    try {
      built = buildRoundTerms(round, project);
    } catch (e) {
      return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    }

    const deadline = Math.floor(Date.now() / 1000) + 2 * 60 * 60;
    const signature = await signRoundApproval({ slug: built.slug, terms: built.terms, deadline });
    const t = built.terms;
    return NextResponse.json({
      ok: true,
      slug: built.slug,
      deadline,
      signature,
      terms: {
        startTime: t.startTime.toString(), endTime: t.endTime.toString(),
        minTicket: t.minTicket.toString(), maxTicket: t.maxTicket.toString(), hardCap: t.hardCap.toString(),
        token: t.token, founder: t.founder, priceUsdt: t.priceUsdt.toString(),
        tgeTime: t.tgeTime.toString(), tgeBps: t.tgeBps, cliffSeconds: t.cliffSeconds, vestingSeconds: t.vestingSeconds,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not prepare the deployment approval." }, { status: 500 });
  }
}
