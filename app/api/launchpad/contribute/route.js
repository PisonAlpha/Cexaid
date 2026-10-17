import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { verifyUsdtTransfer } from "@/lib/launchpad/verifyPayment";
import { CONTRIBUTION_PAYMENT_WALLET } from "@/lib/launchpad/contracts";
import { computeRoundStatus } from "@/lib/launchpad/roundStatus";
import { verifyContributionTx } from "@/lib/launchpad/saleServer";
import { formatUnits } from "viem";
import { USDT_DECIMALS } from "@/lib/launchpad/contracts";

export async function POST(request) {
  const body = await request.json();
  const { roundId, txHash } = body;
  let { wallet, amountUSD } = body;

  if (!roundId || !txHash) {
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
  // A round with a TGE date only runs on its own contract. Never accept direct payments for it.
  if (round.tge_date && !round.contract_address) {
    return NextResponse.json({ ok: false, error: "This round opens once the founder deploys its sale contract." }, { status: 400 });
  }
  // Contract-based round: the on-chain event is the source of truth for who
  // paid and how much. (The contract itself enforces ticket limits and the cap.)
  if (round.contract_address) {
    const supabaseSession0 = await createClient();
    const { data: { user: u0 } } = await supabaseSession0.auth.getUser();
    if (!u0) return NextResponse.json({ ok: false, error: "Log in to your approved investor account first." }, { status: 401 });
    const { data: app0 } = await supabase.from("investor_applications").select("status").eq("user_id", u0.id).maybeSingle();
    if (!app0 || app0.status !== "approved") {
      return NextResponse.json({ ok: false, error: "Private Sale requires an approved investor account. Apply first." }, { status: 403 });
    }

    const v = await verifyContributionTx({ txHash, roundAddress: round.contract_address });
    if (!v.ok) return NextResponse.json({ ok: false, error: v.error }, { status: 400 });

    wallet = v.event.investor;
    amountUSD = Number(formatUnits(v.event.amount, USDT_DECIMALS));

    const { error: insErr } = await supabase.from("contributions").insert({
      wallet,
      amount_usd: amountUSD,
      claim_tokens: amountUSD / round.token_price_usd,
      round_id: roundId,
      project_id: round.project_id,
      tx_hash: txHash,
    });
    if (insErr) return NextResponse.json({ ok: false, error: "This transaction has already been recorded." }, { status: 400 });

    const { error: updErr } = await supabase
      .from("rounds")
      .update({ raised_usd: Number(round.raised_usd) + amountUSD })
      .eq("id", roundId);
    if (updErr) return NextResponse.json({ ok: false, error: updErr.message }, { status: 500 });
    return NextResponse.json({ ok: true, amountUSD });
  }

  if (!wallet || !amountUSD) {
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
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
