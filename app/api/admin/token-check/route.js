import { NextResponse } from "next/server";
import { isAddress, parseAbi, formatUnits } from "viem";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { publicClient } from "@/lib/launchpad/saleServer";

const ABI = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function owner() view returns (address)",
]);

// GET /api/admin/token-check?address=0x...
// Admin-only. Reads a submitted token contract straight from the chain so the
// reviewer can compare it with what the founder claimed.
export async function GET(request) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });

  const address = new URL(request.url).searchParams.get("address") || "";
  if (!isAddress(address)) return NextResponse.json({ ok: false, error: "Not a valid address." }, { status: 400 });

  try {
    const code = await publicClient.getCode({ address });
    if (!code || code === "0x") {
      return NextResponse.json({ ok: true, isContract: false });
    }
    const res = await publicClient.multicall({
      allowFailure: true,
      contracts: ["name", "symbol", "decimals", "totalSupply", "owner"].map((functionName) => ({ address, abi: ABI, functionName })),
    });
    const [name, symbol, decimals, supply, owner] = res.map((r) => (r.status === "success" ? r.result : null));
    return NextResponse.json({
      ok: true,
      isContract: true,
      name,
      symbol,
      decimals: decimals == null ? null : Number(decimals),
      totalSupply: supply == null || decimals == null ? null : formatUnits(supply, Number(decimals)),
      owner,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Could not read the contract. Check the address and network." }, { status: 502 });
  }
}
