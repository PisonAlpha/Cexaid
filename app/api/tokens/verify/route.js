import { NextResponse } from "next/server";
import { createPublicClient, http, isAddress } from "viem";
import { ACTIVE_CHAIN } from "@/lib/launchpad/chain";
import artifacts from "@/lib/tokencreator/artifacts.json";
import verifyStandard from "@/lib/tokencreator/verify-standard.json";
import verifyTax from "@/lib/tokencreator/verify-tax.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Submits a token made with the CEXAID token creator to BscScan for source verification, so people can read
// the code. This route only ever verifies the two exact contracts the creator deploys: before anything is sent,
// the code on-chain at the address must be byte-for-byte equal to one of them. It holds no user keys.

const API = "https://api.etherscan.io/v2/api";
const KINDS = { standard: verifyStandard, tax: verifyTax };

const client = createPublicClient({ chain: ACTIVE_CHAIN, transport: http(process.env.BSC_RPC_URL || undefined) });

// Best-effort per-IP limit (serverless instances do not share memory, so this only blunts casual abuse).
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.t > 60_000) { hits.set(ip, { n: 1, t: now }); return false; }
  rec.n += 1;
  return rec.n > 40;
}
const ipOf = (req) => (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();

const apiKey = () => process.env.ETHERSCAN_API_KEY || process.env.BSCSCAN_API_KEY || "";

export async function POST(req) {
  if (limited(ipOf(req))) return NextResponse.json({ ok: false, error: "Too many requests. Wait a minute and try again." }, { status: 429 });
  const key = apiKey();
  if (!key) return NextResponse.json({ ok: false, manual: true, error: "Automatic verification is not set up on this site." });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 }); }
  const { kind, address, constructorArgs } = body || {};
  if (!KINDS[kind]) return NextResponse.json({ ok: false, error: "Unknown token type." }, { status: 400 });
  if (!isAddress(address || "")) return NextResponse.json({ ok: false, error: "Invalid address." }, { status: 400 });
  if (typeof constructorArgs !== "string" || !/^[0-9a-fA-F]*$/.test(constructorArgs) || constructorArgs.length > 4000) {
    return NextResponse.json({ ok: false, error: "Invalid constructor arguments." }, { status: 400 });
  }

  // The code at this address must be exactly the creator's contract.
  let code;
  try { code = await client.getCode({ address }); } catch { return NextResponse.json({ ok: false, retry: true, error: "Could not read the chain. Retrying…" }); }
  if (!code || code === "0x") return NextResponse.json({ ok: false, retry: true, error: "The contract is not visible on the chain yet." });
  if (code.toLowerCase() !== artifacts.contracts[kind].deployedBytecode.toLowerCase()) {
    return NextResponse.json({ ok: false, error: "That address is not a token made with the CEXAID token creator." }, { status: 400 });
  }

  const c = artifacts.contracts[kind];
  const form = new URLSearchParams({
    apikey: key,
    module: "contract",
    action: "verifysourcecode",
    contractaddress: address,
    sourceCode: JSON.stringify(KINDS[kind]),
    codeformat: "solidity-standard-json-input",
    contractname: `${c.source}:${c.name}`,
    compilerversion: artifacts.compiler,
    constructorArguements: constructorArgs, // (sic) the explorer's own spelling
    licenseType: "3", // MIT
  });

  let data;
  try {
    const res = await fetch(`${API}?chainid=${ACTIVE_CHAIN.id}`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form });
    data = await res.json();
  } catch {
    return NextResponse.json({ ok: false, retry: true, error: "BscScan did not answer. Retrying…" });
  }

  const result = String(data?.result ?? "");
  if (/already verified/i.test(result)) return NextResponse.json({ ok: true, state: "verified" });
  if (data?.status === "1") return NextResponse.json({ ok: true, state: "pending", guid: result });
  if (/unable to locate|not found|does not exist|not yet/i.test(result)) return NextResponse.json({ ok: false, retry: true, error: "BscScan has not indexed the contract yet." });
  return NextResponse.json({ ok: false, error: result || "BscScan rejected the verification request." });
}

export async function GET(req) {
  if (limited(ipOf(req))) return NextResponse.json({ ok: false, error: "Too many requests." }, { status: 429 });
  const key = apiKey();
  const guid = new URL(req.url).searchParams.get("guid") || "";
  if (!key || !/^[A-Za-z0-9]{8,80}$/.test(guid)) return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  try {
    const url = `${API}?chainid=${ACTIVE_CHAIN.id}&module=contract&action=checkverifystatus&guid=${guid}&apikey=${key}`;
    const data = await fetch(url).then((r) => r.json());
    const result = String(data?.result ?? "");
    if (/^pass|already verified/i.test(result)) return NextResponse.json({ ok: true, state: "verified" });
    if (/pending|queue/i.test(result)) return NextResponse.json({ ok: true, state: "pending" });
    return NextResponse.json({ ok: true, state: "failed", message: result });
  } catch {
    return NextResponse.json({ ok: true, state: "pending" });
  }
}
