import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/requireAdmin";

const CG_ID = /^[a-z0-9][a-z0-9-]{0,63}$/;
const ADDR = /^0x[a-fA-F0-9]{40}$/;

// PATCH { projectId, coingeckoId?, contractAddress?, roundId?, tgeDate? }
export async function PATCH(request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });

  try {
    const b = await request.json();
    if (!b.projectId) return NextResponse.json({ ok: false, error: "projectId required." }, { status: 400 });
    const supabase = createAdminClient();

    const cg = (b.coingeckoId || "").trim().toLowerCase();
    const addr = (b.contractAddress || "").trim();
    if (cg && !CG_ID.test(cg)) return NextResponse.json({ ok: false, error: "Invalid CoinGecko id (e.g. \"bitcoin\")." }, { status: 400 });
    if (addr && !ADDR.test(addr)) return NextResponse.json({ ok: false, error: "Contract address must be a 0x… EVM address." }, { status: 400 });

    const { error: pErr } = await supabase
      .from("projects")
      .update({ coingecko_id: cg || null, contract_address: addr || null })
      .eq("id", b.projectId);
    if (pErr) return NextResponse.json({ ok: false, error: pErr.message }, { status: 500 });

    if (b.roundId) {
      let tge = null;
      if (b.tgeDate) {
        const d = new Date(b.tgeDate);
        if (Number.isNaN(d.getTime())) return NextResponse.json({ ok: false, error: "Invalid TGE date." }, { status: 400 });
        tge = d.toISOString();
      }
      const { error: rErr } = await supabase.from("rounds").update({ tge_date: tge }).eq("id", b.roundId);
      if (rErr) return NextResponse.json({ ok: false, error: rErr.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Could not save." }, { status: 500 });
  }
}
