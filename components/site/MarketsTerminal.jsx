"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkline } from "@/components/site/Sparkline";
import { fmtUsd, fmtPct } from "@/lib/market/format";

const TABS = [
  { id: "coins", label: "All Coins" },
  { id: "trending", label: "Trending" },
  { id: "new", label: "New Pairs" },
];
const MAX_PAGES = 10;

function Chg({ v }) {
  if (v == null || Number.isNaN(v)) return <span className="mute">—</span>;
  return <span style={{ color: v >= 0 ? "var(--lp-signal-green)" : "var(--lp-signal-red)" }}>{fmtPct(v)}</span>;
}

function age(ts) {
  if (!ts) return "—";
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 60) return `${Math.max(m, 1)}m`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function MarketsTerminal({ title = "Cryptocurrency Prices by Market Cap" }) {
  const [tab, setTab] = useState("coins");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ coins: [], trending: [], new: [] });
  const [state, setState] = useState("loading");
  const [source, setSource] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState({ key: null, dir: "desc" });

  useEffect(() => {
    try {
      const t = new URLSearchParams(window.location.search).get("tab");
      if (TABS.some((x) => x.id === t)) setTab(t);
    } catch {}
  }, []);

  useEffect(() => {
    let alive = true;
    setState("loading");
    const url = tab === "coins" ? `/api/market?page=${page}` : tab === "trending" ? "/api/market/trending" : "/api/market/new";
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (!d.ok) return setState("error");
        setData((prev) => ({ ...prev, [tab]: tab === "new" ? d.tokens : d.coins }));
        if (d.source) setSource(d.source);
        setState("ready");
      })
      .catch(() => alive && setState("error"));
    return () => {
      alive = false;
    };
  }, [tab, page]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    let r = (data[tab] || []).filter((c) => !term || c.name?.toLowerCase().includes(term) || c.symbol?.toLowerCase().includes(term));
    if (sort.key) {
      r = [...r].sort((a, b) => {
        const x = a[sort.key] ?? -Infinity;
        const y = b[sort.key] ?? -Infinity;
        if (typeof x === "string") return sort.dir === "asc" ? x.localeCompare(y) : y.localeCompare(x);
        return sort.dir === "asc" ? x - y : y - x;
      });
    }
    return r;
  }, [data, tab, q, sort]);

  const th = (key, label, right = true) => (
    <th className={right ? "r" : ""} onClick={() => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }))}>
      {label} {sort.key === key ? (sort.dir === "asc" ? "▲" : "▼") : ""}
    </th>
  );

  const switchTab = (id) => {
    setTab(id);
    setSort({ key: null, dir: "desc" });
    setQ("");
  };

  return (
    <section className="mt">
      <div className="mt__head">
        <h2>{title}</h2>
        <input placeholder={tab === "coins" ? "Filter this page by name or symbol" : "Filter by name or symbol"} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="mt__tabs">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? "on" : ""} onClick={() => switchTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab === "new" && (
        <p className="mt__warn">
          ⚠ Newly listed tokens are unverified and high-risk — many are scams or have very thin liquidity. This list is data only, not an endorsement. Always do your own research.
        </p>
      )}

      {state === "loading" && <p className="mute pad">Loading…</p>}
      {state === "error" && <p className="mute pad">This data is temporarily unavailable (free API limit). Please try again in a minute.</p>}

      {state === "ready" && (
        <div className="mt__wrap">
          {tab === "coins" && (
            <table>
              <thead><tr>{th("rank", "#")}{th("name", "Name", false)}{th("price", "Price")}{th("change1h", "1h")}{th("change24h", "24h")}{th("change7d", "7d")}{th("marketCap", "Market Cap")}{th("volume24h", "Volume (24h)")}<th className="r">Last 7 Days</th></tr></thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td className="r mute">{c.rank ?? "—"}</td>
                    <td><span className="coin">{c.image && <img src={c.image} alt="" width="24" height="24" loading="lazy" />}<b>{c.name}</b> <span className="mute">{c.symbol}</span></span></td>
                    <td className="r">{fmtUsd(c.price, { compact: false })}</td>
                    <td className="r"><Chg v={c.change1h} /></td>
                    <td className="r"><Chg v={c.change24h} /></td>
                    <td className="r"><Chg v={c.change7d} /></td>
                    <td className="r">{fmtUsd(c.marketCap)}</td>
                    <td className="r">{fmtUsd(c.volume24h)}</td>
                    <td className="r"><Sparkline data={c.sparkline} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "trending" && (
            <table>
              <thead><tr><th>#</th><th>Name</th><th className="r">Price</th><th className="r">24h</th><th className="r">Market Cap</th><th className="r">Market Cap Rank</th></tr></thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td className="mute">{c.trendRank}</td>
                    <td><span className="coin">{c.image && <img src={c.image} alt="" width="24" height="24" loading="lazy" />}<b>{c.name}</b> <span className="mute">{c.symbol}</span></span></td>
                    <td className="r">{c.price != null ? fmtUsd(Number(c.price), { compact: false }) : "—"}</td>
                    <td className="r"><Chg v={c.change24h} /></td>
                    <td className="r">{fmtUsd(c.marketCap)}</td>
                    <td className="r mute">{c.rank ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === "new" && (
            <table>
              <thead><tr><th>Token</th><th>Chain</th>{th("price", "Price")}{th("change1h", "1h")}{th("change24h", "24h")}{th("liquidity", "Liquidity")}{th("volume24h", "Volume (24h)")}{th("fdv", "FDV")}{th("createdAt", "Pair age")}<th className="r">Chart</th></tr></thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td><span className="coin">{c.image ? <img src={c.image} alt="" width="24" height="24" loading="lazy" /> : <i className="ph" />}<b>{c.name}</b> <span className="mute">{c.symbol}</span></span></td>
                    <td><span className="chain">{c.chain}</span></td>
                    <td className="r">{fmtUsd(c.price, { compact: false })}</td>
                    <td className="r"><Chg v={c.change1h} /></td>
                    <td className="r"><Chg v={c.change24h} /></td>
                    <td className="r">{fmtUsd(c.liquidity)}</td>
                    <td className="r">{fmtUsd(c.volume24h)}</td>
                    <td className="r">{fmtUsd(c.fdv)}</td>
                    <td className="r mute">{age(c.createdAt)}</td>
                    <td className="r"><a href={c.url} target="_blank" rel="noopener noreferrer" className="ext">DexScreener ↗</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {rows.length === 0 && <p className="mute pad">Nothing matches.</p>}
        </div>
      )}

      {tab === "coins" && state === "ready" && (
        <div className="mt__pager">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <span className="mute">Coins {(page - 1) * 100 + 1}–{page * 100}</span>
          <button disabled={page >= MAX_PAGES} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}

      <p className="mute mt__attr">
        Data: {tab === "new" ? "DexScreener" : tab === "trending" ? "CoinGecko" : source === "coinpaprika" ? "CoinPaprika" : "CoinGecko"}. Refreshed every few minutes. Informational only, not investment advice.
      </p>

      <style jsx>{`
        .mt { display: flex; flex-direction: column; gap: 0.9rem; }
        .mt__head { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
        h2 { margin: 0; font-size: 1.3rem; font-weight: 700; }
        .mt__head input { background: var(--lp-panel); border: 1px solid var(--lp-line); color: var(--lp-ink); border-radius: 8px; padding: 0.55rem 0.85rem; min-width: 260px; font: 0.85rem var(--lp-font-body); }
        .mt__tabs { display: flex; gap: 0.25rem; background: var(--lp-panel); border: 1px solid var(--lp-line); border-radius: 10px; padding: 0.2rem; align-self: flex-start; }
        .mt__tabs button { background: none; border: 0; color: var(--lp-mute); font: 500 0.84rem var(--lp-font-body); padding: 0.45rem 1rem; border-radius: 8px; cursor: pointer; }
        .mt__tabs button.on { background: var(--lp-brass); color: var(--lp-on-accent); }
        .mt__warn { margin: 0; padding: 0.65rem 0.9rem; border-radius: 10px; font-size: 0.8rem; line-height: 1.5; color: #f5c451; background: rgba(245, 196, 81, 0.08); border: 1px solid rgba(245, 196, 81, 0.25); }
        .mute { color: var(--lp-mute); }
        .pad { padding: 1rem 0; font-size: 0.88rem; margin: 0; }
        .mt__wrap { overflow-x: auto; border: 1px solid var(--lp-line); border-radius: 12px; background: var(--lp-panel); }
        table { width: 100%; border-collapse: collapse; font-size: 0.85rem; min-width: 900px; }
        th { text-align: left; padding: 0.8rem 1rem; color: var(--lp-mute); font-weight: 500; font-size: 0.74rem; cursor: pointer; white-space: nowrap; border-bottom: 1px solid var(--lp-line); user-select: none; }
        th:hover { color: var(--lp-ink); }
        td { padding: 0.65rem 1rem; border-bottom: 1px solid var(--lp-line); white-space: nowrap; }
        tr:last-child td { border-bottom: 0; }
        tbody tr:hover { background: var(--lp-panel-raised); }
        .r { text-align: right; }
        .coin { display: inline-flex; align-items: center; gap: 0.6rem; }
        .coin img, .ph { border-radius: 50%; width: 24px; height: 24px; background: var(--lp-panel-raised); display: inline-block; }
        .chain { font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 999px; background: var(--lp-panel-raised); color: var(--lp-mute); text-transform: capitalize; }
        .ext { color: var(--lp-brass-bright); text-decoration: none; font-size: 0.8rem; }
        .mt__pager { display: flex; justify-content: center; align-items: center; gap: 1rem; }
        .mt__pager button { background: var(--lp-panel); border: 1px solid var(--lp-line); color: var(--lp-ink); border-radius: 8px; padding: 0.45rem 0.9rem; cursor: pointer; }
        .mt__pager button:disabled { opacity: 0.4; cursor: default; }
        .mt__attr { text-align: center; margin: 0; font-size: 0.74rem; }
      `}</style>
    </section>
  );
}
