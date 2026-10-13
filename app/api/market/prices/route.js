import { NextResponse } from "next/server";
import { getTokenPrices } from "@/lib/market/sources";

export const revalidate = 300;

const CG_ID = /^[a-z0-9][a-z0-9-]{0,63}$/;
const ADDR = /^0x[a-fA-F0-9]{40}$/;

// GET /api/market/prices?cg=id1,id2&dex=key:0xaddr,key2:0xaddr
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cg = (searchParams.get("cg") || "").split(",").filter((x) => CG_ID.test(x)).slice(0, 40);
  const dex = (searchParams.get("dex") || "")
    .split(",")
    .map((p) => p.split(":"))
    .filter(([k, a]) => CG_ID.test(k || "") && ADDR.test(a || ""))
    .map(([key, address]) => ({ key, address }))
    .slice(0, 20);
  const prices = await getTokenPrices(cg, dex);
  return NextResponse.json({ ok: true, prices }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
}
