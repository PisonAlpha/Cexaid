import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDefiLlamaUnlocks } from "@/lib/market/sources";

export const dynamic = "force-dynamic";

// Market-wide unlock events = admin-curated events (free, always on)
// + DefiLlama Pro feed (only when DEFILLAMA_API_KEY is configured).
export async function GET() {
  const events = [];
  let llama = { enabled: false };

  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("token_unlocks").select("*").order("unlock_date", { ascending: true });
    for (const r of data || []) {
      events.push({
        key: `manual-${r.id}`,
        id: r.id,
        name: r.name,
        symbol: r.symbol,
        geckoId: r.coingecko_id,
        logo: r.logo_url,
        date: r.unlock_date,
        tokens: r.tokens != null ? Number(r.tokens) : null,
        percentOfSupply: r.percent_of_supply != null ? Number(r.percent_of_supply) : null,
        category: r.category,
        note: r.note,
        source: "cexaid",
      });
    }
  } catch {}

  try {
    llama = await getDefiLlamaUnlocks();
    events.push(...llama.events);
  } catch {}

  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  return NextResponse.json({ ok: true, defillamaEnabled: !!llama.enabled, events });
}
