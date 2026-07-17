import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { verifyUsdtTransfer } from "@/lib/launchpad/verifyPayment";
import { CONTRIBUTION_PAYMENT_WALLET } from "@/lib/launchpad/contracts";
import { computeRoundStatus } from "@/lib/launchpad/roundStatus";

export async function POST(request) {
  const { roundId, wallet, amountUSD, txHash } = await request.json();

  if (!roundId || !wallet || !amountUSD || !txHash) {
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: round, error: roundErr } = await supabase
    .from("rounds")
    .select("*")
    .eq("id", roundId)
    .single();
  if (roundErr || !round) return NextResponse.json({ ok: false, error: "Round not found." }, { status: 404 });

  // Every rule re-checked server-side. The client's own checks (in
  // ContributionForm) are just for instant UX feedback - this is the check
  // that actually matters.
  if (round.type === "private" && round.approval_status !== "approved") {
    return NextResponse.json({ ok: false, error: "This round is still under CEXAID review." }, { status: 400 });
  }
  const status = computeRoundStatus({ startsAt: round.starts_at, endsAt: round.ends_at });
  if (status !== "live") {
    return NextResponse.json({ ok: false, error: "This round is not currently open." }, { status: 400 });
  }
  if (amountUSD < round.min_ticket_usd || amountUSD > round.max_ticket_usd) {
    return NextResponse.json({ ok: false, error: "Amount is outside the allowed ticket range." }, { status: 400 });
  }
  if (Number(round.raised_usd) + Number(amountUSD) > round.total_allocation_usd) {
    return NextResponse.json({ ok: false, error: "This would exceed the round's total allocation." }, { status: 400 });
  }

  if (round.requires_approval) {
    const supabaseSession = await createClient();
    const {
      data: { user },
    } = await supabaseSession.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Log in to your approved investor account first." },
        { status: 401 }
      );
    }

    const { data: application } = await supabase
      .from("investor_applications")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!application || application.status !== "approved") {
      return NextResponse.json(
        { ok: false, error: "Private Sale requires an approved investor account. Apply first." },
        { status: 403 }
      );
    }
  }

  const verify = await verifyUsdtTransfer({
    txHash,
    expectedTo: CONTRIBUTION_PAYMENT_WALLET,
    expectedAmountUSD: amountUSD,
  });
  if (!verify.ok) return NextResponse.json({ ok: false, error: verify.error }, { status: 400 });

  const { error: insertErr } = await supabase.from("contributions").insert({
    wallet,
    amount_usd: amountUSD,
    claim_tokens: amountUSD / round.token_price_usd,
    round_id: roundId,
    project_id: round.project_id,
    tx_hash: txHash,
  });
  if (insertErr) {
    return NextResponse.json({ ok: false, error: "This transaction has already been recorded." }, { status: 400 });
  }

  const { error: updateErr } = await supabase
    .from("rounds")
    .update({ raised_usd: Number(round.raised_usd) + Number(amountUSD) })
    .eq("id", roundId);
  if (updateErr) return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
