"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { MarketUnlocks } from "@/components/site/MarketUnlocks";
import { ProjectLogo } from "@/components/launchpad/ProjectLogo";
import { fmtNum, fmtUsd } from "@/lib/market/format";

function addMonths(iso, n) {
  const d = new Date(iso);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d;
}

function buildEvents(rows) {
  const out = [];
  for (const r of rows) {
    if (!r.tge_date || !Array.isArray(r.vesting_schedule) || !r.token_price_usd) continue;
    const totalTokens = Number(r.raised_usd) / Number(r.token_price_usd);
    r.vesting_schedule.forEach((step, i) => {
      if (!step.percent) return;
      out.push({
        key: `${r.id}-${i}`,
        date: addMonths(r.tge_date, i),
        project: r.projects,
        symbol: r.token_symbol,
        label: step.label,
        percent: step.percent,
        tokens: (totalTokens * step.percent) / 100,
      });
    });
  }
  return out.sort((a, b) => a.date - b.date);
}

export default function UnlocksPage() {
  const [rows, setRows] = useState(null);
  const [prices, setPrices] = useState({});
  const [showPast, setShowPast] = useState(false);
  const [tab, setTab] = useState("market");
  const [market, setMarket] = useState(null);

  useEffect(() => {
    fetch("/api/unlocks").then((r) => r.json()).then((d) => d.ok && setMarket(d)).catch(() => setMarket({ events: [], defillamaEnabled: false }));
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("rounds")
      .select("id, token_symbol, token_price_usd, raised_usd, vesting_schedule, tge_date, approval_status, projects(name, slug, logo_url, coingecko_id, contract_address)")
      .eq("approval_status", "approved")
      .not("tge_date", "is", null)
      .then(({ data }) => setRows(data || []));
  }, []);

  const events = useMemo(() => (rows ? buildEvents(rows) : []), [rows]);

  useEffect(() => {
    if (!rows?.length) return;
    const cg = [...new Set(rows.map((r) => r.projects?.coingecko_id).filter(Boolean))];
    const dex = rows
      .filter((r) => !r.projects?.coingecko_id && r.projects?.contract_address)
      .map((r) => `${r.projects.slug}:${r.projects.contract_address}`);
    if (!cg.length && !dex.length) return;
    fetch(`/api/market/prices?cg=${cg.join(",")}&dex=${dex.join(",")}`)
      .then((r) => r.json())
      .then((d) => d.ok && setPrices(d.prices))
      .catch(() => {});
  }, [rows]);

  const now = Date.now();
  const upcoming = events.filter((e) => e.date.getTime() >= now);
  const past = events.filter((e) => e.date.getTime() < now);
  const priceOf = (p) => (p ? prices[p.coingecko_id]?.price ?? prices[p.slug]?.price ?? null : null);

  const renderRow = (e) => {
    const price = priceOf(e.project);
    const days = Math.ceil((e.date.getTime() - now) / 86400000);
    return (
      <tr key={e.key}>
        <td>{e.date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
          <div className="mute">{days >= 0 ? (days === 0 ? "today" : `in ${days}d`) : "unlocked"}</div></td>
        <td>
          <Link href={`/launchpad/${e.project?.slug}`} className="proj">
            <ProjectLogo name={e.project?.name} logoUrl={e.project?.logo_url} size={28} />
            <b>{e.project?.name}</b> <span className="mute">{e.symbol}</span>
          </Link>
        </td>
        <td>{e.label}</td>
        <td className="r">{e.percent}%</td>
        <td className="r">{fmtNum(e.tokens)} {e.symbol}</td>
        <td className="r">{price ? fmtUsd(e.tokens * price) : <span className="mute">—</span>}</td>
      </tr>
    );
  };

  const table = (list) => (
    <div className="wrap">
      <table>
        <thead><tr><th>Date</th><th>Project</th><th>Event</th><th className="r">% of round</th><th className="r">Tokens</th><th className="r">Value</th></tr></thead>
        <tbody>{list.map(renderRow)}</tbody>
      </table>
    </div>
  );

  return (
    <>
      <SiteHeader />
      <main className="un">
        <h1>Token Unlock Calendar</h1>
        <div className="tabs">
          <button className={tab === "market" ? "on" : ""} onClick={() => setTab("market")}>Market-wide</button>
          <button className={tab === "cexaid" ? "on" : ""} onClick={() => setTab("cexaid")}>CEXAID private rounds</button>
        </div>

        {tab === "market" && (
          market === null ? <p className="mute">Loading…</p> : <MarketUnlocks market={market} />
        )}

        {tab === "cexaid" && (
          <>
            <p className="mute">
              Calculated from each CEXAID round&apos;s published vesting schedule and TGE date. Covers tokens sold in CEXAID private rounds only.
              Value appears once a project&apos;s token is trading and linked.
            </p>
            {rows === null && <p className="mute">Loading…</p>}
            {rows && events.length === 0 && <p className="mute">No unlock dates published yet. Projects appear here once their TGE date is set.</p>}
            {upcoming.length > 0 && (<><h2>Upcoming</h2>{table(upcoming)}</>)}
            {past.length > 0 && (
              <>
                <button className="toggle" onClick={() => setShowPast((v) => !v)}>{showPast ? "Hide" : "Show"} past unlocks ({past.length})</button>
                {showPast && table([...past].reverse())}
              </>
            )}
          </>
        )}
      </main>
      <SiteFooter />
      <style jsx>{`
        .un { max-width: 1100px; margin: 0 auto; padding: 1.75rem 1.25rem 4rem; display: flex; flex-direction: column; gap: 1rem; }
        h1 { font-size: 1.6rem; margin: 0; font-weight: 700; }
        h2 { font-size: 1.1rem; margin: 0.5rem 0 0; }
        p { margin: 0; font-size: 0.88rem; line-height: 1.55; max-width: 720px; }
        .mute { color: var(--lp-mute); font-size: 0.78rem; }
        p.mute { font-size: 0.88rem; }
        .wrap { overflow-x: auto; border: 1px solid var(--lp-line); border-radius: 12px; background: var(--lp-panel); }
        table { width: 100%; border-collapse: collapse; font-size: 0.86rem; min-width: 760px; }
        th { text-align: left; padding: 0.8rem 1rem; color: var(--lp-mute); font-weight: 500; font-size: 0.74rem; border-bottom: 1px solid var(--lp-line); }
        td { padding: 0.7rem 1rem; border-bottom: 1px solid var(--lp-line); }
        tr:last-child td { border-bottom: 0; }
        .r { text-align: right; }
        .un :global(.proj) { display: inline-flex; align-items: center; gap: 0.6rem; color: var(--lp-ink); text-decoration: none; }
        .tabs { display: flex; gap: 0.25rem; background: var(--lp-panel); border: 1px solid var(--lp-line); border-radius: 10px; padding: 0.2rem; align-self: flex-start; }
        .tabs button { background: none; border: 0; color: var(--lp-mute); font: 500 0.84rem var(--lp-font-body); padding: 0.45rem 1rem; border-radius: 8px; cursor: pointer; }
        .tabs button.on { background: var(--lp-brass); color: var(--lp-on-accent); }
        .toggle { align-self: flex-start; background: var(--lp-panel); border: 1px solid var(--lp-line); color: var(--lp-ink); border-radius: 8px; padding: 0.5rem 0.9rem; cursor: pointer; }
      `}</style>
    </>
  );
}
