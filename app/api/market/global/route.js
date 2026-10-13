import { NextResponse } from "next/server";
import { getGlobal } from "@/lib/market/sources";

export const revalidate = 300;

export async function GET() {
  const data = await getGlobal();
  return NextResponse.json({ ok: true, ...data }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
}
