import { NextResponse } from "next/server";
import { getNewPairs } from "@/lib/market/sources";

export const revalidate = 120;

export async function GET() {
  try {
    return NextResponse.json({ ok: true, tokens: await getNewPairs() }, { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } });
  } catch {
    return NextResponse.json({ ok: false, error: "New-token data temporarily unavailable." }, { status: 502 });
  }
}
