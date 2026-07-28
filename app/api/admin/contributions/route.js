import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/requireAdmin";

// Add a historical contribution record for a concluded round - does NOT
// touch the round's raised_usd total, since that figure is already set
// correctly when the round was created. This is purely for showing the
// real contributor breakdown, not for recalculating totals.
export async function POST(request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });

  const { roundId, wallet, amountUSD, txHash, contributedAt } = await request.json();

  if (!roundId || !wallet || !amountUSD) {
    return NextResponse.json(
      { ok: false, error: "Round, wallet, and amount are required." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: round, error: roundError } = await supabase
    .from("rounds")
    .select("project_id, token_price_usd")
    .eq("id", roundId)
    .single();
  if (roundError || !round) return NextResponse.json({ ok: false, error: "Round not found." }, { status: 404 });

  const { error } = await supabase.from("contributions").insert({
    wallet,
    amount_usd: Number(amountUSD),
    claim_tokens: Number(amountUSD) / Number(round.token_price_usd),
    round_id: roundId,
    project_id: round.project_id,
    tx_hash: txHash || null,
    created_at: contributedAt || new Date().toISOString(),
  });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// Lists contributions for a specific round, for the admin UI to review
// what's already been added.
export async function GET(request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });

  const roundId = new URL(request.url).searchParams.get("roundId");
  if (!roundId) return NextResponse.json({ ok: false, error: "roundId required." }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("contributions")
    .select("*")
    .eq("round_id", roundId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, contributions: data });
}
