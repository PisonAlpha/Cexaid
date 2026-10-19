import { NextResponse } from "next/server";
import { getCryptoNews, PROVIDERS } from "@/lib/news/sources";

export const dynamic = "force-dynamic";

// Headlines only (title, source, time, link to the original). Cached on the server; see lib/news/sources.js.
export async function GET(req) {
  const limit = Math.min(50, Math.max(1, Number(new URL(req.url).searchParams.get("limit")) || 30));
  const news = await getCryptoNews();
  if (!news) {
    return NextResponse.json({ ok: false, items: [], error: "News is unavailable right now." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  const p = PROVIDERS[news.provider];
  return NextResponse.json(
    { ok: true, provider: p.name, providerUrl: p.url, stale: !!news.stale, fetchedAt: news.fetchedAt, items: news.items.slice(0, limit) },
    { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } }
  );
}
