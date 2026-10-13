import { NextResponse } from "next/server";
import { getTrending } from "@/lib/market/sources";

export const revalidate = 300;

export async function GET() {
  try {
    return NextResponse.json({ ok: true, coins: await getTrending() }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
  } catch {
    return NextResponse.json({ ok: false, error: "Trending data temporarily unavailable." }, { status: 502 });
  }
}
