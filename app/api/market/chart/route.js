import { NextResponse } from "next/server";
import { getCoinChart, CHART_DAYS } from "@/lib/market/sources";

export const revalidate = 120;

// GET /api/market/chart?id=bitcoin&days=7
export async function GET(request) {
  const sp = new URL(request.url).searchParams;
  const id = sp.get("id") || "";
  const days = Number(sp.get("days") || 7);
  if (!/^[a-z0-9][a-z0-9-]{0,99}$/.test(id) || !CHART_DAYS.includes(days)) {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }
  try {
    const points = await getCoinChart(id, days);
    if (points.length < 2) return NextResponse.json({ ok: false, error: "No chart data for this coin." }, { status: 404 });
    return NextResponse.json({ ok: true, id, days, points }, { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } });
  } catch {
    return NextResponse.json({ ok: false, error: "Chart data temporarily unavailable." }, { status: 502 });
  }
}
