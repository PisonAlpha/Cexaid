import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDefiLlamaUnlocks } from "@/lib/market/sources";
import { getPatternUnlocks } from "@/lib/market/pattern";

export const dynamic = "force-dynamic";

// Market-wide unlock events =
//   admin-curated events (free, always on, always win over duplicates)
// + PatternPlus daily unlock feed (free, no key, needs the "Data: PatternPlus" credit wherever shown)
// + DefiLlama Pro feed (only when DEFILLAMA_API_KEY is configured).
export async function GET() {
  const events = [];
  let llama = { enabled: false };
  let pattern = { enabled: false, events: [] };

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

  // Curated events take priority: skip a feed event for the same token on the same day.
  const seen = new Set(events.map((e) => `${(e.symbol || e.name || "").toUpperCase()}|${String(e.date).slice(0, 10)}`));
  const fresh = (list) => list.filter((e) => !seen.has(`${(e.symbol || e.name || "").toUpperCase()}|${String(e.date).slice(0, 10)}`));

  try {
    pattern = await getPatternUnlocks();
    const add = fresh(pattern.events);
    add.forEach((e) => seen.add(`${(e.symbol || e.name || "").toUpperCase()}|${String(e.date).slice(0, 10)}`));
    events.push(...add);
  } catch {}

  try {
    llama = await getDefiLlamaUnlocks();
    events.push(...fresh(llama.events));
  } catch {}

  events.sort((a, b) => new Date(a.date) - new Date(b.date));
  return NextResponse.json({
    ok: true,
    defillamaEnabled: !!llama.enabled,
    patternEnabled: !!pattern.enabled,
    patternAsOf: pattern.asOf || null,
    events,
  });
}
