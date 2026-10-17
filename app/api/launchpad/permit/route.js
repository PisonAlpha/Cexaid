import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { computeRoundStatus } from "@/lib/launchpad/roundStatus";
import { SALE_ROUND_ABI } from "@/lib/launchpad/saleAbi";
import { publicClient, signVoucher, toWei } from "@/lib/launchpad/saleServer";

// Issues a short-lived, wallet-bound voucher that the round contract requires.
// Only logged-in, CEXAID-approved investors ever receive one - this is what
// makes the on-chain sale investor-gated.
export async function POST(request) {
  try {
    const { roundId, wallet, amountUSD } = await request.json();
    if (!roundId || !/^0x[a-fA-F0-9]{40}$/.test(wallet || "") || !(Number(amountUSD) > 0)) {
      return NextResponse.json({ ok: false, error: "Missing or invalid fields." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: round } = await supabase.from("rounds").select("*").eq("id", roundId).single();
    if (!round || !round.contract_address) {
      return NextResponse.json({ ok: false, error: "This round has no sale contract." }, { status: 404 });
    }
    if (round.approval_status !== "approved") {
      return NextResponse.json({ ok: false, error: "This round is still under CEXAID review." }, { status: 400 });
    }
    if (computeRoundStatus({ startsAt: round.starts_at, endsAt: round.ends_at }) !== "live") {
      return NextResponse.json({ ok: false, error: "This round is not currently open." }, { status: 400 });
    }

    const session = await createClient();
    const { data: { user } } = await session.auth.getUser();
    if (!user) return NextResponse.json({ ok: false, error: "Log in to your approved investor account first." }, { status: 401 });
    const { data: application } = await supabase.from("investor_applications").select("status").eq("user_id", user.id).maybeSingle();
    if (!application || application.status !== "approved") {
      return NextResponse.json({ ok: false, error: "Private Sale requires an approved investor account. Apply first." }, { status: 403 });
    }

    // Check against the live contract state so the user never signs a tx that will revert.
    const addr = round.contract_address;
    const read = (functionName, args) => publicClient.readContract({ address: addr, abi: SALE_ROUND_ABI, functionName, args });
    const [nonce, already, raised, hardCap, minTicket, maxTicket, paused, funded, refundsOpen] = await Promise.all([
      read("nonces", [wallet]), read("contributed", [wallet]), read("raised"), read("hardCap"),
      read("minTicket"), read("maxTicket"), read("paused"), read("isFunded"), read("refundsOpen"),
    ]);
    if (refundsOpen) return NextResponse.json({ ok: false, error: "Refunds are open for this round, so it no longer accepts contributions." }, { status: 400 });
    if (!funded) return NextResponse.json({ ok: false, error: "The founder has not deposited the sale tokens into the contract yet. Contributions open once they do." }, { status: 400 });
    const amountWei = toWei(amountUSD);
    if (paused) return NextResponse.json({ ok: false, error: "This sale is temporarily paused." }, { status: 400 });
    if (already + amountWei < minTicket) return NextResponse.json({ ok: false, error: "Below the minimum ticket for this round." }, { status: 400 });
    if (already + amountWei > maxTicket) return NextResponse.json({ ok: false, error: "Above the maximum ticket per wallet for this round." }, { status: 400 });
    if (raised + amountWei > hardCap) return NextResponse.json({ ok: false, error: "This would exceed the round's hard cap." }, { status: 400 });

    const deadline = Math.floor(Date.now() / 1000) + 15 * 60;
    const signature = await signVoucher({ roundAddress: addr, investor: wallet, amountWei, deadline, nonce });

    return NextResponse.json({ ok: true, deadline, nonce: nonce.toString(), signature, amountWei: amountWei.toString(), roundAddress: addr });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Could not prepare the contribution. Please try again." }, { status: 500 });
  }
}
