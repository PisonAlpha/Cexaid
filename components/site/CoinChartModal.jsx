"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fmtUsd, fmtPct } from "@/lib/market/format";

const RANGES = [
  { days: 1, label: "24H" },
  { days: 7, label: "7D" },
  { days: 30, label: "1M" },
  { days: 90, label: "3M" },
  { days: 365, label: "1Y" },
];
const EXCHANGES = [
  { id: "BINANCE", label: "Binance (USDT)", quote: "USDT" },
  { id: "BYBIT", label: "Bybit (USDT)", quote: "USDT" },
  { id: "OKX", label: "OKX (USDT)", quote: "USDT" },
  { id: "COINBASE", label: "Coinbase (USD)", quote: "USD" },
];
const W = 800;
const H = 300;

// ---- Our own price-history chart (CoinGecko data through /api/market/chart) ----
function HistoryChart({ id }) {
  const [days, setDays] = useState(7);
  const [state, setState] = useState("loading");
  const [points, setPoints] = useState([]);
  const [hover, setHover] = useState(null);
  const box = useRef(null);

  useEffect(() => {
    let alive = true;
    setState("loading");
    setHover(null);
    fetch(`/api/market/chart?id=${encodeURIComponent(id)}&days=${days}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (!d.ok) return setState(d.error || "error");
        setPoints(d.points);
        setState("ready");
      })
      .catch(() => alive && setState("error"));
    return () => { alive = false; };
  }, [id, days]);

  // Refresh the 24H view every minute so it stays current while the pop-up is open.
  useEffect(() => {
    if (days !== 1) return;
    const t = setInterval(() => {
      fetch(`/api/market/chart?id=${encodeURIComponent(id)}&days=1`).then((r) => r.json()).then((d) => d.ok && setPoints(d.points)).catch(() => {});
    }, 60000);
    return () => clearInterval(t);
  }, [id, days]);

  const geo = useMemo(() => {
    if (points.length < 2) return null;
    const t0 = points[0][0], t1 = points[points.length - 1][0];
    let min = Infinity, max = -Infinity;
    for (const [, v] of points) { if (v < min) min = v; if (v > max) max = v; }
    const pad = (max - min || max || 1) * 0.08;
    const lo = min - pad, hi = max + pad;
    const x = (t) => ((t - t0) / (t1 - t0 || 1)) * W;
    const y = (v) => H - ((v - lo) / (hi - lo)) * H;
    const line = points.map(([t, v]) => `${x(t).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
    const up = points[points.length - 1][1] >= points[0][1];
    return { x, y, line, up, min, max, t0, t1 };
  }, [points]);

  function onMove(e) {
    if (!geo || !box.current) return;
    const r = box.current.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const t = geo.t0 + frac * (geo.t1 - geo.t0);
    let lo = 0, hi = points.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (points[mid][0] < t) lo = mid; else hi = mid; }
    const i = Math.abs(points[lo][0] - t) < Math.abs(points[hi][0] - t) ? lo : hi;
    setHover(i);
  }

  const color = geo?.up ? "#16c784" : "#ea3943";
  const first = points[0]?.[1];
  const last = points[points.length - 1]?.[1];
  const periodChg = first && last ? ((last - first) / first) * 100 : null;
  const hp = hover != null ? points[hover] : null;
  const dateFmt = (t) =>
    new Date(t).toLocaleString(undefined, days <= 1 ? { hour: "2-digit", minute: "2-digit" } : days <= 7 ? { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" } : { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="hc">
      <div className="hc__bar">
        <div className="hc__ranges">
          {RANGES.map((r) => (
            <button key={r.days} type="button" className={days === r.days ? "on" : ""} onClick={() => setDays(r.days)}>{r.label}</button>
          ))}
        </div>
        {state === "ready" && periodChg != null && (
          <span style={{ color }}>{fmtPct(periodChg)} <span className="mute">over this period</span></span>
        )}
      </div>

      {state === "loading" && <div className="hc__msg">Loading chart…</div>}
      {state !== "loading" && state !== "ready" && (
        <div className="hc__msg">{state === "error" ? "Chart data is temporarily unavailable. Try again in a minute, or use the Advanced chart tab." : state}</div>
      )}

      {state === "ready" && geo && (
        <div className="hc__plot" ref={box} onMouseMove={onMove} onMouseLeave={() => setHover(null)} onTouchMove={(e) => onMove(e.touches[0])} onTouchEnd={() => setHover(null)}>
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-label="Price chart">
            <defs>
              <linearGradient id="hcfill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.28" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={`0,${H} ${geo.line} ${W},${H}`} fill="url(#hcfill)" />
            <polyline points={geo.line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            {hp && <line x1={geo.x(hp[0])} x2={geo.x(hp[0])} y1="0" y2={H} stroke="#8a93a3" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />}
          </svg>
          {hp && <span className="hc__dot" style={{ left: `${(geo.x(hp[0]) / W) * 100}%`, top: `${(geo.y(hp[1]) / H) * 100}%`, background: color }} />}
          <span className="hc__axis hc__axis--hi">{fmtUsd(geo.max, { compact: false })}</span>
          <span className="hc__axis hc__axis--lo">{fmtUsd(geo.min, { compact: false })}</span>
          {hp && (
            <div className="hc__tip" style={{ left: `${Math.min(80, Math.max(0, (geo.x(hp[0]) / W) * 100 - 10))}%` }}>
              <b>{fmtUsd(hp[1], { compact: false })}</b>
              <span>{dateFmt(hp[0])}</span>
            </div>
          )}
        </div>
      )}
      <p className="hc__note mute">Price history from CoinGecko. Hover or touch the chart to read a price at any point.</p>

      <style jsx>{`
        .hc { display: flex; flex-direction: column; gap: 0.7rem; }
        .hc__bar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.6rem; font-size: 0.85rem; }
        .hc__ranges { display: flex; gap: 0.2rem; background: var(--lp-panel-raised); border-radius: 8px; padding: 0.2rem; }
        .hc__ranges button { background: none; border: 0; color: var(--lp-mute); font: 500 0.8rem var(--lp-font-body); padding: 0.35rem 0.75rem; border-radius: 6px; cursor: pointer; }
        .hc__ranges button.on { background: var(--lp-brass); color: var(--lp-on-accent); }
        .hc__msg { height: 300px; display: flex; align-items: center; justify-content: center; text-align: center; color: var(--lp-mute); font-size: 0.88rem; padding: 0 1rem; background: var(--lp-panel-raised); border-radius: 10px; }
        .hc__plot { position: relative; height: 300px; background: var(--lp-panel-raised); border-radius: 10px; overflow: hidden; cursor: crosshair; touch-action: pan-y; }
        .hc__plot svg { width: 100%; height: 100%; display: block; }
        .hc__dot { position: absolute; width: 10px; height: 10px; border-radius: 50%; transform: translate(-50%, -50%); border: 2px solid var(--lp-panel); pointer-events: none; }
        .hc__axis { position: absolute; right: 8px; font-size: 0.7rem; color: var(--lp-mute); pointer-events: none; }
        .hc__axis--hi { top: 6px; }
        .hc__axis--lo { bottom: 6px; }
        .hc__tip { position: absolute; top: 8px; display: flex; flex-direction: column; gap: 0.1rem; background: var(--lp-panel); border: 1px solid var(--lp-line); border-radius: 8px; padding: 0.35rem 0.6rem; font-size: 0.78rem; pointer-events: none; }
        .hc__tip span { color: var(--lp-mute); font-size: 0.7rem; }
        .hc__note { margin: 0; font-size: 0.72rem; }
        .mute { color: var(--lp-mute); }
      `}</style>
    </div>
  );
}

// ---- TradingView Advanced Chart widget (live, candles + indicators + drawing tools) ----
function TradingViewChart({ symbol, exchange }) {
  const ref = useRef(null);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = "";
    const quote = EXCHANGES.find((e) => e.id === exchange)?.quote || "USDT";
    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    widget.style.height = "100%";
    widget.style.width = "100%";
    host.appendChild(widget);
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: `${exchange}:${symbol.toUpperCase().replace(/[^A-Z0-9]/g, "")}${quote}`,
      interval: "60",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "rgba(17, 20, 27, 1)",
      allow_symbol_change: true,
      hide_side_toolbar: false,
      withdateranges: true,
      save_image: false,
      support_host: "https://www.tradingview.com",
    });
    host.appendChild(script);
    return () => { host.innerHTML = ""; };
  }, [symbol, exchange]);
  return <div className="tradingview-widget-container" ref={ref} style={{ height: "100%", width: "100%" }} />;
}

export function CoinChartModal({ item, onClose }) {
  // item: { kind: "coin", id, name, symbol, image, price, change24h, rank }  or
  //       { kind: "pair", name, symbol, image, price, change24h, chain, pair, url }
  const isPair = item.kind === "pair";
  const [tab, setTab] = useState(!isPair && (item.rank ?? 9999) > 150 ? "history" : isPair ? "dex" : "tv");
  const [exchange, setExchange] = useState("BINANCE");
  const closeRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const dexSrc = isPair && item.chain && item.pair && /^[a-z0-9-]+$/i.test(item.chain) && /^[A-Za-z0-9]+$/.test(item.pair)
    ? `https://dexscreener.com/${item.chain}/${item.pair}?embed=1&theme=dark&trades=0&info=0`
    : null;

  return (
    <div className="cm" role="dialog" aria-modal="true" aria-label={`${item.name} chart`} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cm__card">
        <div className="cm__head">
          <span className="cm__id">
            {item.image ? <img src={item.image} alt="" width="32" height="32" /> : <i className="cm__ph" />}
            <span>
              <b>{item.name}</b> <span className="mute">{item.symbol}</span>
              <span className="cm__price">
                {item.price != null ? fmtUsd(Number(item.price), { compact: false }) : "—"}
                {item.change24h != null && (
                  <span style={{ color: item.change24h >= 0 ? "var(--lp-signal-green)" : "var(--lp-signal-red)" }}> {fmtPct(item.change24h)} <span className="mute">24h</span></span>
                )}
              </span>
            </span>
          </span>
          <button ref={closeRef} type="button" className="cm__close" onClick={onClose} aria-label="Close chart">✕</button>
        </div>

        {!isPair && (
          <div className="cm__tabs">
            <button type="button" className={tab === "tv" ? "on" : ""} onClick={() => setTab("tv")}>Advanced chart (live)</button>
            <button type="button" className={tab === "history" ? "on" : ""} onClick={() => setTab("history")}>Price history</button>
            {tab === "tv" && (
              <select value={exchange} onChange={(e) => setExchange(e.target.value)} aria-label="Exchange">
                {EXCHANGES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
              </select>
            )}
          </div>
        )}

        <div className="cm__body">
          {!isPair && tab === "tv" && (
            <>
              <div className="cm__tv"><TradingViewChart symbol={item.symbol || ""} exchange={exchange} /></div>
              <p className="cm__note mute">
                Live market chart by <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer">TradingView</a>, showing the {item.symbol}/{EXCHANGES.find((e) => e.id === exchange)?.quote} market on the exchange you pick. If this exchange doesn&apos;t list {item.symbol}, choose another one, search a symbol inside the chart, or open Price history.
              </p>
            </>
          )}
          {!isPair && tab === "history" && <HistoryChart id={item.id} />}
          {isPair && (
            dexSrc ? (
              <>
                <div className="cm__tv"><iframe title={`${item.name} DEX chart`} src={dexSrc} loading="lazy" referrerPolicy="no-referrer" /></div>
                <p className="cm__note mute">
                  Live DEX chart by <a href="https://dexscreener.com" target="_blank" rel="noopener noreferrer">DexScreener</a>.
                  {item.url && <> <a href={item.url} target="_blank" rel="noopener noreferrer">Open full page ↗</a></>}
                </p>
              </>
            ) : (
              <p className="cm__note mute">No embedded chart for this pair. {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer">Open on DexScreener ↗</a>}</p>
            )
          )}
          <p className="cm__note mute">Charts are for information only, not investment advice.</p>
        </div>
      </div>

      <style jsx>{`
        .cm { position: fixed; inset: 0; z-index: 80; background: rgba(5, 7, 12, 0.72); display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .cm__card { width: min(980px, 100%); max-height: calc(100vh - 2rem); overflow-y: auto; background: var(--lp-panel); border: 1px solid var(--lp-line); border-radius: 14px; padding: 1rem 1.1rem 1.1rem; display: flex; flex-direction: column; gap: 0.8rem; }
        .cm__head { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
        .cm__id { display: flex; align-items: center; gap: 0.75rem; }
        .cm__id img, .cm__ph { width: 32px; height: 32px; border-radius: 50%; background: var(--lp-panel-raised); display: inline-block; }
        .cm__price { display: block; font-size: 0.95rem; margin-top: 0.15rem; }
        .cm__close { background: var(--lp-panel-raised); border: 1px solid var(--lp-line); color: var(--lp-ink); border-radius: 8px; width: 34px; height: 34px; cursor: pointer; flex: none; }
        .cm__tabs { display: flex; gap: 0.3rem; align-items: center; flex-wrap: wrap; }
        .cm__tabs button { background: none; border: 1px solid var(--lp-line); color: var(--lp-mute); font: 500 0.82rem var(--lp-font-body); padding: 0.4rem 0.9rem; border-radius: 8px; cursor: pointer; }
        .cm__tabs button.on { background: var(--lp-brass); border-color: var(--lp-brass); color: var(--lp-on-accent); }
        .cm__tabs select { margin-left: auto; background: var(--lp-panel-raised); border: 1px solid var(--lp-line); color: var(--lp-ink); border-radius: 8px; padding: 0.4rem 0.6rem; font: 0.82rem var(--lp-font-body); }
        .cm__body { display: flex; flex-direction: column; gap: 0.6rem; }
        .cm__tv { height: min(520px, 62vh); border-radius: 10px; overflow: hidden; background: var(--lp-panel-raised); }
        .cm__tv :global(iframe) { width: 100%; height: 100%; border: 0; }
        .cm__note { margin: 0; font-size: 0.72rem; line-height: 1.5; }
        .cm__note a { color: var(--lp-brass-bright); }
        .mute { color: var(--lp-mute); }
      `}</style>
    </div>
  );
}
