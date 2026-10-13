import { NextResponse } from "next/server";
import { getMarkets } from "@/lib/market/sources";

export const revalidate = 300;

// GET /api/market?page=1..10  (100 coins per page, up to the top 1,000)
export async function GET(request) {
  const raw = Number(new URL(request.url).searchParams.get("page") || 1);
  const page = Number.isInteger(raw) && raw >= 1 && raw <= 10 ? raw : 1;
  try {
    const data = await getMarkets(page, 100);
    return NextResponse.json({ ok: true, page, ...data }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Market data temporarily unavailable." }, { status: 502 });
  }
}
