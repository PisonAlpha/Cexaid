"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { isRoundPublic } from "@/lib/launchpad/roundStatus";
import { LedgerTape } from "@/components/launchpad/LedgerTape";
import { ProjectCard } from "@/components/launchpad/ProjectCard";
import { ProjectLogo } from "@/components/launchpad/ProjectLogo";
import { WalletConnectButton } from "@/components/launchpad/WalletConnectButton";
import { useLaunchpad } from "@/lib/launchpad/LaunchpadContext";
import { fmtUsd, fmtPct } from "@/lib/market/format";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "upcoming", label: "Upcoming" },
  { id: "closed", label: "Concluded" },
];

export default function LaunchpadMarketplace() {
  const { liveProjects, rounds, wallet, loaded } = useLaunchpad();
  const [view, setView] = useState("table");
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState({ key: "date", dir: "desc" });
  const [prices, setPrices] = useState({});

  // One row per project: its most recent public round.
  const rows = useMemo(() => {
    return liveProjects
      .map((project) => {
        const pr = rounds
          .filter((r) => r.projectId === project.id && isRoundPublic(r))
          .sort((a, b) => new Date(b.endsAt) - new Date(a.endsAt));
        const round = pr[0];
        if (!round) return null;
        return { project, round, pct: round.totalAllocationUSD ? (round.raisedUSD / round.totalAllocationUSD) * 100 : 0 };
      })
      .filter(Boolean);
  }, [liveProjects, rounds]);

  // Live prices for projects that have been linked to a market listing.
  useEffect(() => {
    const cg = [...new Set(rows.map((r) => r.project.coingeckoId).filter(Boolean))];
    const dex = rows.filter((r) => !r.project.coingeckoId && r.project.contractAddress).map((r) => `${r.project.slug}:${r.project.contractAddress}`);
    if (!cg.length && !dex.length) return;
    fetch(`/api/market/prices?cg=${cg.join(",")}&dex=${dex.join(",")}`)
      .then((r) => r.json())
      .then((d) => d.ok && setPrices(d.prices))
      .catch(() => {});
  }, [rows]);

  const priceOf = (p) => prices[p.coingeckoId]?.price ?? prices[p.slug]?.price ?? null;
  const roiOf = (r) => {
    const cur = priceOf(r.project);
    return cur && r.round.tokenPriceUSD ? cur / r.round.tokenPriceUSD : null;
  };

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = rows.filter(
      (r) =>
        (filter === "all" || r.round.status === filter) &&
        (!term || r.project.name.toLowerCase().includes(term) || (r.round.tokenSymbol || "").toLowerCase().includes(term))
    );
    const val = {
      name: (r) => r.project.name.toLowerCase(),
      price: (r) => r.round.tokenPriceUSD,
      raised: (r) => r.round.raisedUSD,
      pct: (r) => r.pct,
      date: (r) => new Date(r.round.endsAt).getTime(),
      roi: (r) => roiOf(r) ?? -1,
    }[sort.key];
    list = [...list].sort((a, b) => {
      const x = val(a), y = val(b);
      const c = typeof x === "string" ? x.localeCompare(y) : x - y;
      return sort.dir === "asc" ? c : -c;
    });
    return list;
  }, [rows, filter, q, sort, prices]); // eslint-disable-line react-hooks/exhaustive-deps

  const liveCount = rows.filter((r) => r.round.status === "live").length;
  const totalRaised = rounds.filter(isRoundPublic).reduce((s, r) => s + r.raisedUSD, 0);
  const th = (key, label, right) => (
    <th className={right ? "r" : ""} onClick={() => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }))}>
      {label} {sort.key === key ? (sort.dir === "asc" ? "▲" : "▼") : ""}
    </th>
  );
  const badge = { live: "Live", upcoming: "Upcoming", closed: "Concluded" };

  return (
    <main className="hub">
      <section className="hub__hero">
        <div>
          <h1>Private Sale Launchpad</h1>
          <p>Every round is reviewed by CEXAID, and only approved investors can contribute. Apply once, unlock every project.</p>
        </div>
        <div className="hub__hero-actions">
          <Link href="/launchpad/create-token" className="hub__create">Create a token</Link>
          <WalletConnectButton />
        </div>
      </section>

      <div className="hub__kpis">
        <div><span>Total raised</span><b>{fmtUsd(totalRaised)}</b></div>
        <div><span>Projects</span><b>{rows.length}</b></div>
        <div><span>Rounds open now</span><b>{liveCount}</b></div>
        <div><span>Chain</span><b>BNB Chain</b></div>
      </div>

      {wallet.address && (
        <div className="hub__status">
          {wallet.isApprovedInvestor ? (
            <span className="ok">✓ Approved investor — you can contribute to any live Private Sale.</span>
          ) : (
            <span>Not yet an approved investor. <Link href="/launchpad/apply-investor">Apply for access</Link> to unlock Private Sale rounds platform-wide.</span>
          )}
        </div>
      )}

      <LedgerTape />

      <div className="hub__toolbar">
        <div className="hub__tabs">
          {FILTERS.map((f) => (
            <button key={f.id} className={filter === f.id ? "on" : ""} onClick={() => setFilter(f.id)}>{f.label}</button>
          ))}
        </div>
        <div className="hub__tools">
          <input placeholder="Search project or token" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="hub__toggle">
            <button className={view === "table" ? "on" : ""} onClick={() => setView("table")}>Table</button>
            <button className={view === "cards" ? "on" : ""} onClick={() => setView("cards")}>Cards</button>
          </div>
        </div>
      </div>

      {!loaded && <p className="mute">Loading projects…</p>}
      {loaded && visible.length === 0 && <p className="mute">No projects match.</p>}

      {view === "table" && visible.length > 0 && (
        <div className="hub__wrap">
          <table>
            <thead>
              <tr>
                {th("name", "Project")}
                <th>Status</th>
                {th("price", "Sale price", true)}
                {th("raised", "Raised", true)}
                {th("pct", "Filled", true)}
                <th className="r">Current price</th>
                {th("roi", "ROI", true)}
                {th("date", "Ends", true)}
                <th>Chain</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(({ project, round, pct }) => {
                const cur = priceOf(project);
                const roi = roiOf({ project, round });
                return (
                  <tr key={project.id}>
                    <td>
                      <Link href={`/launchpad/${project.slug}`} className="proj">
                        <ProjectLogo name={project.name} logoUrl={project.logoUrl} size={32} />
                        <span><b>{project.name}</b><small>{round.tokenSymbol}</small></span>
                      </Link>
                    </td>
                    <td><span className={`pill pill--${round.status}`}>{badge[round.status]}</span></td>
                    <td className="r">{fmtUsd(round.tokenPriceUSD, { compact: false })}</td>
                    <td className="r">{fmtUsd(round.raisedUSD)}<small>of {fmtUsd(round.totalAllocationUSD)}</small></td>
                    <td className="r">
                      <div className="bar"><i style={{ width: `${Math.min(100, pct)}%` }} /></div>
                      <small>{pct.toFixed(0)}%</small>
                    </td>
                    <td className="r">{cur ? fmtUsd(cur, { compact: false }) : <span className="mute">—</span>}</td>
                    <td className="r">
                      {roi ? <b style={{ color: roi >= 1 ? "var(--lp-signal-green)" : "var(--lp-signal-red)" }}>{roi.toFixed(2)}x</b> : <span className="mute">—</span>}
                    </td>
                    <td className="r">{new Date(round.endsAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</td>
                    <td>{round.chain}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {view === "cards" && visible.length > 0 && (
        <div className="hub__cards">
          {visible.map(({ project }) => (
            <ProjectCard key={project.id} project={project} rounds={rounds} />
          ))}
        </div>
      )}

      <p className="mute hub__note">
        ROI = current market price ÷ private-sale price, shown only for tokens that are trading and linked to a public price feed (CoinGecko / DexScreener). Past performance is not a guarantee of future results.
      </p>

      <section className="hub__how">
        <h2>How it works</h2>
        <ol>
          <li><b>Founders get verified.</b> KYC is required before any project can list.</li>
          <li><b>CEXAID reviews every round.</b> Terms, vesting and allocation are checked before going public.</li>
          <li><b>Investors apply once.</b> Approved investors get access to every Private Sale on the platform.</li>
        </ol>
        <div className="hub__links">
          <Link href="/launchpad/apply-investor">Apply as investor</Link>
          <Link href="/launchpad/kyc">Founder KYC</Link>
          <Link href="/launchpad/apply-private-sale">Apply for Private Sale</Link>
          <Link href="/unlocks">Unlock calendar</Link>
        </div>
      </section>

      <footer className="hub__footer">
        <Link href="/">CEXAID Home</Link>
        <Link href="/about">Team &amp; Contact</Link>
        <Link href="/terms">Terms of Service</Link>
        <Link href="/privacy">Privacy Policy</Link>
      </footer>

      <style jsx>{`
        .hub { max-width: 1280px; margin: 0 auto; padding: 1.5rem 1.25rem 4rem; display: flex; flex-direction: column; gap: 1.25rem; }
        .hub__hero { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
        h1 { margin: 0 0 0.35rem; font-size: 1.7rem; font-weight: 700; }
        .hub__hero-actions { display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap; }
        :global(.hub__create) { border: 1px solid var(--lp-brass); color: var(--lp-brass-bright); padding: 0.55rem 0.95rem; border-radius: 8px; font-size: 0.82rem; font-weight: 600; text-decoration: none; }
        :global(.hub__create:hover) { background: var(--lp-brass); color: var(--lp-on-accent); }
        .hub__hero p { margin: 0; color: var(--lp-mute); font-size: 0.92rem; max-width: 560px; line-height: 1.55; }
        .hub__kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 0.75rem; }
        .hub__kpis div { background: var(--lp-panel); border: 1px solid var(--lp-line); border-radius: 12px; padding: 0.9rem 1rem; display: flex; flex-direction: column; gap: 0.25rem; }
        .hub__kpis span { color: var(--lp-mute); font-size: 0.74rem; }
        .hub__kpis b { font-size: 1.3rem; }
        .hub__status { background: var(--lp-panel); border: 1px solid var(--lp-line); border-radius: 10px; padding: 0.7rem 1rem; font-size: 0.85rem; color: var(--lp-mute); }
        .hub__status .ok { color: var(--lp-signal-green); }
        .hub__status :global(a) { color: var(--lp-brass); }
        .hub__toolbar { display: flex; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
        .hub__tabs, .hub__toggle { display: flex; gap: 0.25rem; background: var(--lp-panel); border: 1px solid var(--lp-line); border-radius: 10px; padding: 0.2rem; }
        .hub__tabs button, .hub__toggle button { background: none; border: 0; color: var(--lp-mute); font: 500 0.82rem var(--lp-font-body); padding: 0.4rem 0.85rem; border-radius: 8px; cursor: pointer; }
        .hub__tabs button.on, .hub__toggle button.on { background: var(--lp-brass); color: var(--lp-on-accent); }
        .hub__tools { display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap; }
        .hub__tools input { background: var(--lp-panel); border: 1px solid var(--lp-line); color: var(--lp-ink); border-radius: 10px; padding: 0.5rem 0.8rem; font: 0.85rem var(--lp-font-body); min-width: 210px; }
        .hub__wrap { overflow-x: auto; border: 1px solid var(--lp-line); border-radius: 12px; background: var(--lp-panel); }
        table { width: 100%; border-collapse: collapse; font-size: 0.85rem; min-width: 980px; }
        th { text-align: left; padding: 0.8rem 1rem; color: var(--lp-mute); font-weight: 500; font-size: 0.74rem; cursor: pointer; white-space: nowrap; border-bottom: 1px solid var(--lp-line); user-select: none; }
        th:hover { color: var(--lp-ink); }
        td { padding: 0.7rem 1rem; border-bottom: 1px solid var(--lp-line); white-space: nowrap; }
        tr:last-child td { border-bottom: 0; }
        tbody tr:hover { background: var(--lp-panel-raised); }
        .r { text-align: right; }
        td small, td :global(small) { display: block; color: var(--lp-mute); font-size: 0.72rem; }
        .hub :global(.proj) { display: inline-flex; align-items: center; gap: 0.7rem; color: var(--lp-ink); text-decoration: none; }
        .proj span { display: flex; flex-direction: column; }
        .pill { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.55rem; border-radius: 999px; }
        .pill--live { background: rgba(22, 199, 132, 0.14); color: var(--lp-signal-green); }
        .pill--upcoming { background: rgba(55, 114, 255, 0.16); color: var(--lp-brass-bright); }
        .pill--closed { background: rgba(138, 147, 163, 0.14); color: var(--lp-mute); }
        .bar { width: 90px; height: 5px; border-radius: 3px; background: var(--lp-line); margin-left: auto; overflow: hidden; }
        .bar i { display: block; height: 100%; background: var(--lp-brass); }
        .hub__cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem; }
        .mute { color: var(--lp-mute); font-size: 0.85rem; }
        .hub__note { font-size: 0.74rem; line-height: 1.5; margin: 0; }
        .hub__how { border-top: 1px solid var(--lp-line); padding-top: 1.5rem; }
        .hub__how h2 { font-size: 1.15rem; margin: 0 0 0.75rem; }
        .hub__how ol { margin: 0; padding-left: 1.1rem; color: var(--lp-mute); font-size: 0.9rem; line-height: 1.7; }
        .hub__how b { color: var(--lp-ink); }
        .hub__links { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 1rem; }
        .hub__links :global(a) { border: 1px solid var(--lp-line); border-radius: 8px; padding: 0.45rem 0.85rem; color: var(--lp-ink); font-size: 0.82rem; text-decoration: none; background: var(--lp-panel); }
        .hub__links :global(a:hover) { border-color: var(--lp-brass); }
        .hub__footer { display: flex; flex-wrap: wrap; justify-content: center; gap: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--lp-line); }
        .hub__footer :global(a) { font-size: 0.78rem; color: var(--lp-mute); text-decoration: none; }
        .hub__footer :global(a:hover) { color: var(--lp-brass); }
      `}</style>
    </main>
  );
}
