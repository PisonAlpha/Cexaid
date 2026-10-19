"use client";

import { useMemo, useState } from "react";
import { fmtNum, fmtUsd } from "@/lib/market/format";

const PAGE = 50;
const RANGES = [
  { id: "30", label: "Next 30 days", days: 30 },
  { id: "90", label: "Next 90 days", days: 90 },
  { id: "all", label: "All upcoming", days: null },
];
const SOURCE_LABEL = { pattern: "PatternPlus", cexaid: "CEXAID", defillama: "DefiLlama" };

const dayStart = () => { const d = new Date(); d.setUTCHours(0, 0, 0, 0); return d.getTime(); };

export function MarketUnlocks({ market }) {
  const [q, setQ] = useState("");
  const [range, setRange] = useState("30");
  const [sort, setSort] = useState("date");
  const [shown, setShown] = useState(PAGE);

  const now = dayStart();
  const all = market?.events || [];

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const days = RANGES.find((r) => r.id === range)?.days;
    const end = days ? now + days * 86400000 : Infinity;
    const out = all.filter((e) => {
      const t = new Date(e.date).getTime();
      if (t < now || t > end) return false;
      return !term || (e.name || "").toLowerCase().includes(term) || (e.symbol || "").toLowerCase().includes(term);
    });
    if (sort === "value") out.sort((a, b) => (b.valueUsd ?? -1) - (a.valueUsd ?? -1) || new Date(a.date) - new Date(b.date));
    else out.sort((a, b) => new Date(a.date) - new Date(b.date) || (b.valueUsd ?? -1) - (a.valueUsd ?? -1));
    return out;
  }, [all, q, range, sort, now]);

  const hasPattern = all.some((e) => e.source === "pattern");
  const sources = [
    hasPattern && "PatternPlus",
    all.some((e) => e.source === "cexaid") && "CEXAID",
    market?.defillamaEnabled && "DefiLlama",
  ].filter(Boolean);

  return (
    <div className="mu">
      <p className="mu__intro">
        Upcoming unlocks across the market{sources.length ? `, from ${sources.join(", ")}` : ""}. Dates and amounts come from
        each project&apos;s published tokenomics and can change. Always verify with the project before trading.
      </p>

      <div className="mu__bar">
        <input value={q} onChange={(e) => { setQ(e.target.value); setShown(PAGE); }} placeholder="Search token or symbol" />
        <select value={range} onChange={(e) => { setRange(e.target.value); setShown(PAGE); }} aria-label="Time range">
          {RANGES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="date">Soonest first</option>
          <option value="value">Largest value first</option>
        </select>
      </div>

      {list.length === 0 ? (
        <p className="mu__empty">{all.length === 0 ? "No unlock events yet." : "No unlocks match this filter."}</p>
      ) : (
        <div className="mu__wrap">
          <table>
            <thead>
              <tr><th>Date</th><th>Token</th><th>Category</th><th className="r">Tokens</th><th className="r">Value</th><th className="r">% of supply</th><th>Source</th></tr>
            </thead>
            <tbody>
              {list.slice(0, shown).map((e) => {
                const days = Math.ceil((new Date(e.date).getTime() - now) / 86400000);
                return (
                  <tr key={e.key}>
                    <td>{new Date(e.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" })}
                      <div className="mu__mute">{days === 0 ? "today" : `in ${days}d`}</div></td>
                    <td><b>{e.name}</b> <span className="mu__mute">{e.symbol && e.symbol !== e.name ? e.symbol : ""}</span></td>
                    <td className="mu__cat">{e.category || "—"}</td>
                    <td className="r">{e.tokens ? fmtNum(e.tokens) : "—"}</td>
                    <td className="r">{e.valueUsd ? fmtUsd(e.valueUsd) : "—"}</td>
                    <td className="r">{e.percentOfSupply != null ? `${Number(e.percentOfSupply).toFixed(2)}%` : "—"}</td>
                    <td className="mu__mute">{SOURCE_LABEL[e.source] || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {list.length > shown && (
        <button type="button" className="mu__more" onClick={() => setShown((n) => n + PAGE)}>
          Show more ({list.length - shown} left)
        </button>
      )}

      {hasPattern && (
        <p className="mu__credit">
          <a href="https://pattern.plus" target="_blank" rel="noopener noreferrer">Data: PatternPlus</a>
          {market?.patternAsOf ? ` · updated ${market.patternAsOf.slice(0, 10)}` : ""} · licensed CC BY 4.0
        </p>
      )}

      <style jsx>{`
        .mu { display: flex; flex-direction: column; gap: 0.9rem; }
        .mu__intro { margin: 0; font-size: 0.88rem; line-height: 1.55; max-width: 720px; color: var(--lp-mute); }
        .mu__bar { display: flex; gap: 0.6rem; flex-wrap: wrap; }
        .mu__bar input, .mu__bar select { background: var(--lp-panel); border: 1px solid var(--lp-line); border-radius: 8px; color: var(--lp-ink); padding: 0.5rem 0.75rem; font: 0.86rem var(--lp-font-body); }
        .mu__bar input { flex: 1; min-width: 180px; }
        .mu__wrap { overflow-x: auto; border: 1px solid var(--lp-line); border-radius: 12px; background: var(--lp-panel); }
        table { width: 100%; border-collapse: collapse; font-size: 0.86rem; min-width: 820px; }
        th { text-align: left; padding: 0.8rem 1rem; color: var(--lp-mute); font-weight: 500; font-size: 0.74rem; border-bottom: 1px solid var(--lp-line); }
        td { padding: 0.7rem 1rem; border-bottom: 1px solid var(--lp-line); vertical-align: top; }
        tr:last-child td { border-bottom: 0; }
        .r { text-align: right; }
        .mu__mute { color: var(--lp-mute); font-size: 0.78rem; }
        .mu__cat { max-width: 240px; color: var(--lp-mute); font-size: 0.8rem; }
        .mu__empty { margin: 0; color: var(--lp-mute); font-size: 0.88rem; }
        .mu__more { align-self: flex-start; background: var(--lp-panel); border: 1px solid var(--lp-line); color: var(--lp-ink); border-radius: 8px; padding: 0.5rem 0.9rem; cursor: pointer; }
        .mu__credit { margin: 0; font-size: 0.78rem; color: var(--lp-mute); }
        .mu__credit a { color: var(--lp-brass-bright); text-decoration: none; }
      `}</style>
    </div>
  );
}
