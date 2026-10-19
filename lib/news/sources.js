// Crypto headlines from free, key-less public feeds. We only ever pass on the headline, the source name, the time
// and the link to the original article. No article text and no article images are copied.
//   Primary:  Alphaday   (https://api.alphaday.com/items/news/)  - free, no key, fair-use limits
//   Fallback: cryptocurrency.cv (https://cryptocurrency.cv/api/news) - free, no key, fair use, asks clients to cache
// Everything is cached on the server (5 minutes) so visitors never hit these services directly, and the last good
// result is kept in memory in case both are briefly down.

const ALPHADAY = "https://api.alphaday.com/items/news/";
const CV = "https://cryptocurrency.cv/api/news";
const UA = "CEXAID/1.0 (+https://www.cexaid.com)";
const REVALIDATE = 300;

export const PROVIDERS = {
  alphaday: { name: "Alphaday", url: "https://alphaday.com" },
  cv: { name: "cryptocurrency.cv", url: "https://cryptocurrency.cv" },
};

let lastGood = null; // { provider, items, fetchedAt }

const clean = (v, max) => (typeof v === "string" ? v.replace(/<[^>]*>/g, "").replace(/[\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "");

function safeUrl(v) {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch { return null; }
}
const safeIso = (v) => {
  const t = new Date(v).getTime();
  return Number.isFinite(t) && t < Date.now() + 5 * 60000 ? new Date(t).toISOString() : null;
};

export function mapAlphaday(payload) {
  const rows = Array.isArray(payload?.results) ? payload.results : [];
  const out = [];
  for (const r of rows) {
    const title = clean(r?.title, 220);
    const url = safeUrl(r?.url);
    const publishedAt = safeIso(r?.published_at);
    if (!title || !url || !publishedAt) continue;
    out.push({
      id: `ad-${r.id ?? r.hash ?? url}`,
      title,
      url,
      source: clean(r?.source?.name, 60) || new URL(url).hostname.replace(/^www\./, ""),
      icon: safeUrl(r?.source?.icon),
      publishedAt,
    });
  }
  return out;
}

export function mapCv(payload) {
  const rows = Array.isArray(payload?.articles) ? payload.articles : [];
  const out = [];
  for (const r of rows) {
    const title = clean(r?.title, 220);
    const url = safeUrl(r?.link);
    const publishedAt = safeIso(r?.pubDate);
    if (!title || !url || !publishedAt) continue;
    out.push({
      id: `cv-${url}`,
      title,
      url,
      source: clean(typeof r?.source === "string" ? r.source : r?.source?.name, 60) || new URL(url).hostname.replace(/^www\./, ""),
      icon: null,
      publishedAt,
    });
  }
  return out;
}

async function getJson(url) {
  const res = await fetch(url, { headers: { accept: "application/json", "user-agent": UA }, next: { revalidate: REVALIDATE }, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`${new URL(url).host} returned ${res.status}`);
  return res.json();
}

function dedupe(items) {
  const seen = new Set();
  return items.filter((i) => {
    const k = i.url.replace(/[?#].*$/, "").toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export async function getCryptoNews() {
  // 1. Alphaday: two pages (20 items each) in parallel.
  try {
    const pages = await Promise.all([getJson(ALPHADAY), getJson(`${ALPHADAY}?page=2`).catch(() => null)]);
    const items = dedupe(pages.flatMap((p) => (p ? mapAlphaday(p) : []))).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    if (items.length) { lastGood = { provider: "alphaday", items, fetchedAt: new Date().toISOString() }; return lastGood; }
  } catch { /* fall through to the fallback */ }

  // 2. cryptocurrency.cv
  try {
    const items = dedupe(mapCv(await getJson(`${CV}?limit=40`))).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    if (items.length) { lastGood = { provider: "cv", items, fetchedAt: new Date().toISOString() }; return lastGood; }
  } catch { /* fall through */ }

  if (lastGood) return { ...lastGood, stale: true };
  return null;
}
