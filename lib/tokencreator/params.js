// Shared by the token creator form (browser) and anything that needs the same rules.
// The contracts re-check everything on-chain; this is so people get a clear message first.
import { encodeAbiParameters, isAddress } from "viem";
import artifacts from "./artifacts.json";

export const MAX_TAX_PCT = 10;
export const MIN_LIMIT_PCT = 0.1;
export const MAX_UINT128 = (1n << 128n) - 1n;

// Symbols and names that are commonly faked. CEXAID's own token must never be impersonated.
const RESERVED_SYMBOLS = ["USDT", "USDC", "BUSD", "DAI", "BNB", "WBNB", "BTC", "WBTC", "ETH", "WETH", "SOL", "XRP", "CXD", "CEXAID"];
const RESERVED_NAME_PARTS = ["cexaid"];

export const ABI = { standard: artifacts.contracts.standard.abi, tax: artifacts.contracts.tax.abi };
export const BYTECODE = { standard: artifacts.contracts.standard.bytecode, tax: artifacts.contracts.tax.bytecode };

// "3.5" -> 350 basis points. Up to 2 decimals. Returns null if it is not a valid percentage.
export function pctToBps(text) {
  const t = String(text ?? "").trim();
  if (t === "") return null;
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(t)) return null;
  const [w, f = ""] = t.split(".");
  return Number(w) * 100 + Number((f + "00").slice(0, 2));
}

// "1000000" -> 1000000n (whole tokens). Digits only, no decimals, no separators.
export function parseWholeSupply(text) {
  const t = String(text ?? "").replace(/[,\s_]/g, "");
  if (!/^\d{1,30}$/.test(t)) return null;
  const n = BigInt(t);
  return n > 0n ? n : null;
}

export function supplyToBase(whole, decimals) {
  return whole * 10n ** BigInt(decimals);
}

export function limitAmountFromPct(pctText, supplyBase) {
  const t = String(pctText ?? "").trim();
  if (t === "") return 0n; // no limit
  const bps = pctToBps(t);
  if (bps == null) return null;
  return (supplyBase * BigInt(bps)) / 10_000n;
}

export const fmtWhole = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// Returns { errors: {field: message}, values } where values is ready for the contract when there are no errors.
export function validateForm(kind, f, connectedAddress) {
  const errors = {};
  const name = (f.name ?? "").trim();
  const symbol = (f.symbol ?? "").trim();

  if (!name) errors.name = "Enter a token name.";
  else if (name.length > 64) errors.name = "Keep the name to 64 characters or fewer.";
  else if (/[\u0000-\u001f<>]/.test(name)) errors.name = "The name has characters that are not allowed.";
  else if (RESERVED_NAME_PARTS.some((p) => name.toLowerCase().includes(p))) errors.name = "That name is reserved for CEXAID's own token.";

  if (!symbol) errors.symbol = "Enter a symbol.";
  else if (!/^[A-Za-z0-9._-]{1,16}$/.test(symbol)) errors.symbol = "Use 1 to 16 letters, numbers, dots, dashes or underscores.";
  else if (RESERVED_SYMBOLS.includes(symbol.toUpperCase())) errors.symbol = `${symbol.toUpperCase()} is a reserved symbol. Pick a different one.`;

  const decimals = Number(f.decimals);
  if (!Number.isInteger(decimals) || decimals < 6 || decimals > 18) errors.decimals = "Decimals must be a whole number from 6 to 18.";

  const whole = parseWholeSupply(f.supply);
  if (whole == null) errors.supply = "Enter the total supply as a whole number, for example 1000000.";
  let supplyBase = null;
  if (whole != null && !errors.decimals) {
    supplyBase = supplyToBase(whole, decimals);
    if (supplyBase > MAX_UINT128) errors.supply = "That supply is too large for the chosen decimals.";
  }

  const values = { name, symbol, decimals, supplyBase };

  if (kind === "tax") {
    const buy = pctToBps(f.buyTax);
    const sell = pctToBps(f.sellTax);
    if (buy == null) errors.buyTax = "Enter a buy tax from 0 to 10 (up to 2 decimals).";
    else if (buy > MAX_TAX_PCT * 100) errors.buyTax = "The buy tax cannot be above 10%.";
    if (sell == null) errors.sellTax = "Enter a sell tax from 0 to 10 (up to 2 decimals).";
    else if (sell > MAX_TAX_PCT * 100) errors.sellTax = "The sell tax cannot be above 10%.";

    const wallet = (f.taxWallet ?? "").trim();
    if (!isAddress(wallet)) errors.taxWallet = "Enter a valid wallet address (0x…).";
    else if (/^0x0{40}$/i.test(wallet)) errors.taxWallet = "The tax wallet cannot be the zero address.";

    let maxTx = 0n;
    let maxWallet = 0n;
    for (const [field, label] of [["maxTx", "max transaction"], ["maxWallet", "max wallet"]]) {
      const text = String(f[field] ?? "").trim();
      if (text === "") continue;
      const bps = pctToBps(text);
      if (bps == null) errors[field] = `Enter the ${label} as a percentage of supply, for example 1.`;
      else if (bps < MIN_LIMIT_PCT * 100) errors[field] = `The ${label} cannot be below ${MIN_LIMIT_PCT}% of supply.`;
      else if (bps > 10_000) errors[field] = `The ${label} cannot be above 100%.`;
      else if (supplyBase != null) {
        const amt = limitAmountFromPct(text, supplyBase);
        if (field === "maxTx") maxTx = amt; else maxWallet = amt;
      }
    }
    Object.assign(values, { buyBps: buy, sellBps: sell, taxWallet: wallet, maxTx, maxWallet });
  }

  return { errors, values, ok: Object.keys(errors).length === 0 };
}

export function constructorArgs(kind, v) {
  if (kind === "standard") return [v.name, v.symbol, v.decimals, v.supplyBase];
  return [v.name, v.symbol, v.decimals, v.supplyBase, BigInt(v.buyBps), BigInt(v.sellBps), v.taxWallet, v.maxTx, v.maxWallet];
}

// ABI-encoded constructor arguments (no 0x), as BscScan wants them for verification.
export function encodedConstructorArgs(kind, args) {
  const ctor = ABI[kind].find((x) => x.type === "constructor");
  return encodeAbiParameters(ctor.inputs, args).slice(2);
}
