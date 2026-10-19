// PatternPlus token unlock feed (https://www.pattern.plus/developers).
// Free, no key, CC BY 4.0, commercial use allowed. The ONE condition is attribution: wherever this data is shown,
// show "Data: PatternPlus" linked to https://pattern.plus. The files are rebuilt once a day (about 04:00 UTC),
// so we cache for an hour and keep the last good copy in memory in case a refresh fails.

const URL_UNLOCKS = "https://pattern.plus/api/v1/unlocks.json";
const MAX_EVENTS = 800;

export const PATTERN_ATTRIBUTION = { text: "Data: PatternPlus", href: "https://pattern.plus" };

let lastGood = null; // { events, asOf }

const str = (v, max = 120) => (typeof v === "string" ? v.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, max) : "");
const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);

export function mapPatternEvents(payload) {
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  const events = [];
  rows.slice(0, MAX_EVENTS).forEach((r, i) => {
    const date = typeof r?.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(r.date) ? r.date : null;
    const name = str(r?.name);
    const symbol = str(r?.symbol, 20).toUpperCase();
    if (!date || (!name && !symbol)) return;
    const cats = Array.isArray(r.categories) ? r.categories.map((c) => str(c, 60)).filter(Boolean) : [];
    events.push({
      key: `pattern-${str(r.token, 80) || symbol}-${date}-${i}`,
      name: name || symbol,
      symbol,
      date: `${date}T00:00:00.000Z`,
      tokens: num(r.amount),
      valueUsd: num(r.value_usd),
      percentOfSupply: num(r.pct_total), // % of total supply
      percentOfCirculating: num(r.pct_circulating),
      category: cats.join(", ") || null,
      source: "pattern",
    });
  });
  return events;
}

export async function getPatternUnlocks() {
  try {
    const res = await fetch(URL_UNLOCKS, {
      headers: { accept: "application/json", "user-agent": "CEXAID/1.0 (+https://www.cexaid.com)" },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`PatternPlus returned ${res.status}`);
    const json = await res.json();
    const events = mapPatternEvents(json);
    if (events.length === 0) throw new Error("PatternPlus returned no usable events");
    lastGood = { events, asOf: str(json?.as_of, 40) || null };
    return { enabled: true, ...lastGood, attribution: PATTERN_ATTRIBUTION };
  } catch (e) {
    if (lastGood) return { enabled: true, stale: true, ...lastGood, attribution: PATTERN_ATTRIBUTION };
    return { enabled: false, events: [], error: String(e?.message || e) };
  }
}
