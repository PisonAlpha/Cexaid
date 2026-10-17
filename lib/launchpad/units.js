import { parseUnits, formatUnits } from "viem";

// DB numerics can arrive as numbers like 2e-5, which parseUnits rejects.
export function decimalString(value, maxDecimals = 18) {
  const s = String(value);
  if (!/e/i.test(s)) return s;
  return Number(value).toFixed(maxDecimals).replace(/0+$/, "").replace(/\.$/, "");
}
export const usdToWei = (value) => parseUnits(decimalString(value), 18);

export function fmtUnits(value, decimals = 18, maxFrac = 4) {
  if (value == null) return "—";
  const n = Number(formatUnits(value, decimals));
  return n.toLocaleString(undefined, { maximumFractionDigits: maxFrac });
}

// Builds a month-indexed schedule (index = months after TGE) for the unlock calendar.
export function monthlySteps(tgePercent, cliffMonths, linearMonths) {
  const steps = [{ label: "At TGE", percent: tgePercent }];
  const rest = 100 - tgePercent;
  const total = Math.min(cliffMonths + linearMonths, 60);
  for (let m = 1; m <= total; m++) {
    const inLinear = m > cliffMonths && linearMonths > 0;
    steps.push({ label: `Month ${m}`, percent: inLinear ? Number((rest / linearMonths).toFixed(4)) : 0 });
  }
  return steps;
}
