import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/requireAdmin";

const CG_ID = /^[a-z0-9][a-z0-9-]{0,63}$/;

export async function POST(request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
  try {
    const b = await request.json();
    const name = (b.name || "").trim();
    const symbol = (b.symbol || "").trim().toUpperCase();
    const date = new Date(b.unlockDate);
    if (!name || !symbol || Number.isNaN(date.getTime()))
      return NextResponse.json({ ok: false, error: "Name, symbol and a valid unlock date are required." }, { status: 400 });
    const cg = (b.coingeckoId || "").trim().toLowerCase();
    if (cg && !CG_ID.test(cg)) return NextResponse.json({ ok: false, error: "Invalid CoinGecko id." }, { status: 400 });
    const num = (v) => (v === "" || v == null || Number.isNaN(Number(v)) ? null : Number(v));

    const { error } = await createAdminClient().from("token_unlocks").insert({
      name,
      symbol,
      coingecko_id: cg || null,
      logo_url: (b.logoUrl || "").trim() || null,
      unlock_date: date.toISOString(),
      tokens: num(b.tokens),
      percent_of_supply: num(b.percentOfSupply),
      category: (b.category || "").trim() || null,
      note: (b.note || "").trim() || null,
    });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not save." }, { status: 500 });
  }
}

export async function DELETE(request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "id required." }, { status: 400 });
  const { error } = await createAdminClient().from("token_unlocks").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
