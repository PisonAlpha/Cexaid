export function fmtUsd(n, opts = {}) {
  if (n == null || Number.isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (opts.compact !== false && abs >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (opts.compact !== false && abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (opts.compact !== false && abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1000) return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (abs >= 1) return `$${n.toFixed(2)}`;
  if (abs >= 0.01) return `$${n.toFixed(4)}`;
  if (abs === 0) return "$0";
  return `$${n.toPrecision(3)}`;
}
export function fmtPct(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}
export function fmtNum(n) {
  if (n == null || Number.isNaN(n)) return "—";
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
