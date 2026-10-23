import { createPublicClient, http, fallback, decodeEventLog, parseUnits, keccak256, toBytes, encodeAbiParameters } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { ACTIVE_CHAIN, SALE_FACTORY_ADDRESS } from "./chain";
import { SALE_ROUND_ABI, SALE_FACTORY_ABI } from "./saleAbi";
import { USDT_DECIMALS } from "./contracts";
import { usdToWei } from "./units";

// Server-only helpers for the contract-based private sale.

export const publicClient = createPublicClient({
  chain: ACTIVE_CHAIN,
  // Short timeouts and several public endpoints, so one slow or rate-limited RPC cannot hang a request.
  transport: fallback(
    [
      process.env.BSC_RPC_URL,
      "https://bsc-dataseed.bnbchain.org",
      "https://bsc-rpc.publicnode.com",
      "https://bsc-dataseed1.defibit.io",
    ]
      .filter(Boolean)
      .map((url) => http(url, { timeout: 6000, retryCount: 0 }))
  ),
});

export function getApprover() {
  const key = process.env.APPROVER_PRIVATE_KEY;
  if (!key) throw new Error("APPROVER_PRIVATE_KEY is not configured.");
  return privateKeyToAccount(key.startsWith("0x") ? key : `0x${key}`);
}

export const toWei = (usd) => parseUnits(String(usd), USDT_DECIMALS);

// Signs an investor voucher that the round contract checks on-chain.
export async function signVoucher({ roundAddress, investor, amountWei, deadline, nonce }) {
  const account = getApprover();
  return account.signTypedData({
    domain: {
      name: "CexaidPrivateSale",
      version: "1",
      chainId: ACTIVE_CHAIN.id,
      verifyingContract: roundAddress,
    },
    types: {
      Contribute: [
        { name: "investor", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "deadline", type: "uint256" },
        { name: "nonce", type: "uint256" },
      ],
    },
    primaryType: "Contribute",
    message: { investor, amount: amountWei, deadline: BigInt(deadline), nonce },
  });
}

// Reads the real Contributed event from a transaction on the round contract.
export async function verifyContributionTx({ txHash, roundAddress }) {
  let receipt;
  try {
    receipt = await publicClient.getTransactionReceipt({ hash: txHash });
  } catch {
    return { ok: false, error: "Couldn't find that transaction on-chain yet. Wait a few seconds and try again." };
  }
  if (receipt.status !== "success") return { ok: false, error: "That transaction failed on-chain." };

  const events = [];
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== roundAddress.toLowerCase()) continue;
    try {
      const d = decodeEventLog({ abi: SALE_ROUND_ABI, data: log.data, topics: log.topics });
      if (d.eventName === "Contributed") events.push(d.args);
    } catch {}
  }
  if (events.length !== 1) {
    return { ok: false, error: "That transaction is not a single contribution to this round's contract." };
  }
  return { ok: true, event: events[0] };
}

// Confirms a createRound transaction really came from our factory and returns the new round address.
export async function verifyRoundCreationTx(txHash) {
  if (!SALE_FACTORY_ADDRESS) return { ok: false, error: "NEXT_PUBLIC_SALE_FACTORY_ADDRESS is not configured." };
  let receipt;
  try {
    receipt = await publicClient.getTransactionReceipt({ hash: txHash });
  } catch {
    return { ok: false, error: "Couldn't find that transaction yet. Wait a few seconds and try again." };
  }
  if (receipt.status !== "success") return { ok: false, error: "That transaction failed on-chain." };
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== SALE_FACTORY_ADDRESS.toLowerCase()) continue;
    try {
      const d = decodeEventLog({ abi: SALE_FACTORY_ABI, data: log.data, topics: log.topics });
      if (d.eventName === "RoundCreated") return { ok: true, round: d.args.round, args: d.args };
    } catch {}
  }
  return { ok: false, error: "That transaction did not create a round from the CEXAID factory." };
}

// ── Founder-deployed rounds ────────────────────────────────────────────────
// CEXAID approves a round by signing its exact terms. The factory only lets the
// founder's own wallet deploy a round whose terms match that signature.

const MONTH_SECONDS = 30 * 86400;
const TERM_ABI = [
  { type: "uint64" }, { type: "uint64" }, { type: "uint256" }, { type: "uint256" }, { type: "uint256" },
  { type: "address" }, { type: "address" }, { type: "uint256" }, { type: "uint64" }, { type: "uint16" },
  { type: "uint32" }, { type: "uint32" },
];

// Builds the on-chain terms for a round from the approved listing. Throws a readable Error if the listing is incomplete.
export function buildRoundTerms(round, project) {
  const token = project?.contract_address;
  const founder = project?.founder_wallet;
  if (!token) throw new Error("The project has no token contract.");
  if (!founder) throw new Error("The project has no founder wallet.");
  if (!round.tge_date || round.vest_tge_percent == null || round.vest_cliff_months == null || round.vest_linear_months == null) {
    throw new Error("This listing has no TGE date or vesting terms.");
  }
  const sec = (d) => BigInt(Math.floor(new Date(d).getTime() / 1000));
  return {
    slug: `${project.slug}-${round.slug}`,
    terms: {
      startTime: sec(round.starts_at),
      endTime: sec(round.ends_at),
      minTicket: usdToWei(round.min_ticket_usd),
      maxTicket: usdToWei(round.max_ticket_usd),
      hardCap: usdToWei(round.total_allocation_usd),
      token,
      founder,
      priceUsdt: usdToWei(round.token_price_usd),
      tgeTime: sec(round.tge_date),
      tgeBps: Math.round(Number(round.vest_tge_percent) * 100),
      cliffSeconds: Number(round.vest_cliff_months) * MONTH_SECONDS,
      vestingSeconds: Number(round.vest_linear_months) * MONTH_SECONDS,
    },
  };
}

const termsHash = (t) =>
  keccak256(
    encodeAbiParameters(TERM_ABI, [
      t.startTime, t.endTime, t.minTicket, t.maxTicket, t.hardCap, t.token, t.founder,
      t.priceUsdt, t.tgeTime, t.tgeBps, t.cliffSeconds, t.vestingSeconds,
    ])
  );

// Signs CEXAID's approval of one round (checked by the factory contract).
export async function signRoundApproval({ slug, terms, deadline }) {
  const account = getApprover();
  return account.signTypedData({
    domain: { name: "CexaidSaleFactory", version: "1", chainId: ACTIVE_CHAIN.id, verifyingContract: SALE_FACTORY_ADDRESS },
    types: {
      ApproveRound: [
        { name: "slugHash", type: "bytes32" },
        { name: "termsHash", type: "bytes32" },
        { name: "founder", type: "address" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "ApproveRound",
    message: { slugHash: keccak256(toBytes(slug)), termsHash: termsHash(terms), founder: terms.founder, deadline: BigInt(deadline) },
  });
}
