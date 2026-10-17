import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ACTIVE_CHAIN } from "@/lib/launchpad/chain";
import { verifyRoundCreationTx, publicClient, buildRoundTerms } from "@/lib/launchpad/saleServer";
import { SALE_ROUND_ABI } from "@/lib/launchpad/saleAbi";

// Links a round to the contract the founder deployed. The server re-reads the
// transaction and the deployed contract on-chain and never trusts an address
// typed by the browser. Only a genuine factory round whose slug and every term
// match the approved listing can be linked, so it does not matter who calls this.
export async function POST(request) {
  try {
    const { roundId, txHash } = await request.json();
    if (!roundId || !/^0x[a-fA-F0-9]{64}$/.test(txHash || "")) {
      return NextResponse.json({ ok: false, error: "roundId and a valid txHash are required." }, { status: 400 });
    }
    const supabase = createAdminClient();
    const { data: round } = await supabase.from("rounds").select("*").eq("id", roundId).single();
    if (!round) return NextResponse.json({ ok: false, error: "Round not found." }, { status: 404 });
    if (round.approval_status !== "approved") return NextResponse.json({ ok: false, error: "This round is not approved." }, { status: 403 });
    if (round.contract_address) return NextResponse.json({ ok: false, error: "This round already has a contract." }, { status: 400 });

    const v = await verifyRoundCreationTx(txHash);
    if (!v.ok) return NextResponse.json({ ok: false, error: v.error }, { status: 400 });

    const { data: used } = await supabase.from("rounds").select("id").eq("contract_address", v.round).maybeSingle();
    if (used) return NextResponse.json({ ok: false, error: "That contract is already linked to a round." }, { status: 400 });

    const { data: project } = await supabase.from("projects").select("slug, founder_wallet, contract_address").eq("id", round.project_id).single();
    let expected;
    try {
      expected = buildRoundTerms(round, project);
    } catch (e) {
      return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    }
    if (v.args.slug !== expected.slug) {
      return NextResponse.json({ ok: false, error: "The deployed contract was created for a different listing." }, { status: 400 });
    }

    // The deployed contract's terms must match the approved listing - read straight from the chain.
    const read = (functionName) => publicClient.readContract({ address: v.round, abi: SALE_ROUND_ABI, functionName });
    const [hardCap, minTicket, maxTicket, token, founder, price, tge, tgeBps, cliff, vesting, start, end] = await Promise.all([
      read("hardCap"), read("minTicket"), read("maxTicket"), read("token"), read("founder"), read("priceUsdt"),
      read("tgeTime"), read("tgeBps"), read("cliffSeconds"), read("vestingSeconds"), read("startTime"), read("endTime"),
    ]);
    const t = expected.terms;
    const problems = [];
    if (hardCap !== t.hardCap || minTicket !== t.minTicket || maxTicket !== t.maxTicket) problems.push("cap or ticket limits");
    if (price !== t.priceUsdt) problems.push("token price");
    if (token.toLowerCase() !== t.token.toLowerCase()) problems.push("token address");
    if (founder.toLowerCase() !== t.founder.toLowerCase()) problems.push("founder wallet");
    if (BigInt(start) !== t.startTime || BigInt(end) !== t.endTime) problems.push("sale dates");
    if (BigInt(tge) !== t.tgeTime) problems.push("TGE date");
    if (tgeBps !== t.tgeBps || cliff !== t.cliffSeconds || vesting !== t.vestingSeconds) problems.push("vesting terms");
    if (problems.length) {
      return NextResponse.json({ ok: false, error: `The deployed contract does not match this listing (${problems.join(", ")}).` }, { status: 400 });
    }

    const { error } = await supabase.from("rounds").update({ contract_address: v.round, chain_id: ACTIVE_CHAIN.id }).eq("id", roundId);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, contractAddress: v.round });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not link the contract." }, { status: 500 });
  }
}
