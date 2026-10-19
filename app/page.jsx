"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { MarketsTerminal } from "@/components/site/MarketsTerminal";
import { TokenSection } from "@/components/site/TokenSection";
import { fmtUsd, fmtPct, fmtNum } from "@/lib/market/format";

function Card({ title, href, children, credit, wide }) {
  return (
    <div className={wide ? "card card--wide" : "card"}>
      <div className="card__head">
        <b>{title}</b>
        <Link href={href}>More ›</Link>
      </div>
      <div className="card__body">{children}</div>
      {credit && <a className="card__credit" href={credit.href} target="_blank" rel="noopener noreferrer">{credit.text}</a>}
      <style jsx>{`
        .card { background: var(--lp-panel); border: 1px solid var(--lp-line); border-radius: 12px; padding: 0.9rem 1rem; display: flex; flex-direction: column; gap: 0.6rem; min-width: 0; }
        .card__head { display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; }
        .card__head :global(a) { color: var(--lp-mute); font-size: 0.76rem; text-decoration: none; }
        .card__head :global(a:hover) { color: var(--lp-brass-bright); }
        .card__body { display: flex; flex-direction: column; gap: 0.5rem; }
        .card--wide { grid-column: 1 / -1; }
        .card--wide .card__body { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.8rem 1.6rem; }
        .card__credit { color: var(--lp-mute); font-size: 0.7rem; text-decoration: none; margin-top: auto; }
        .card__credit:hover { color: var(--lp-brass-bright); }
      `}</style>
    </div>
  );
}

function Row({ left, sub, right, rightColor }) {
  return (
    <div className="row">
      <span className="row__l">{left}{sub && <small>{sub}</small>}</span>
      <span className="row__r" style={rightColor ? { color: rightColor } : null}>{right}</span>
      <style jsx>{`
        .row { display: flex; justify-content: space-between; gap: 0.75rem; font-size: 0.84rem; }
        .row__l { display: flex; align-items: center; gap: 0.5rem; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .row__l small { color: var(--lp-mute); font-size: 0.72rem; }
        .row__r { white-space: nowrap; }
      `}</style>
    </div>
  );
}

const SERVICES = [
  { t: "CEX Listing", d: "Exchange readiness, documentation and positioning." },
  { t: "VC & Investor Network", d: "Introductions, pitch prep and fundraising strategy." },
  { t: "Token Launchpad", d: "KYC-verified founders, investor-gated private sales, published vesting." },
  { t: "Early-Stage Funding", d: "Seed support, incubation and expansion advisory." },
];

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [fresh, setFresh] = useState([]);
  const [unlocks, setUnlocks] = useState([]);
  const [patternOn, setPatternOn] = useState(false);
  const [news, setNews] = useState(null);
  const [lp, setLp] = useState(null);

  useEffect(() => {
    fetch("/api/market/trending").then((r) => r.json()).then((d) => d.ok && setTrending(d.coins.slice(0, 5))).catch(() => {});
    fetch("/api/market/new").then((r) => r.json()).then((d) => d.ok && setFresh(d.tokens.slice(0, 5))).catch(() => {});
    fetch("/api/unlocks").then((r) => r.json()).then((d) => {
      if (!d.ok) return;
      const today = new Date(); today.setUTCHours(0, 0, 0, 0);
      const up = d.events.filter((e) => new Date(e.date) >= today);
      const soon = up.filter((e) => new Date(e.date).getTime() <= today.getTime() + 14 * 86400000);
      const pool = soon.length >= 5 ? soon : up;
      const top = [...pool].sort((a, b) => (b.valueUsd ?? -1) - (a.valueUsd ?? -1) || new Date(a.date) - new Date(b.date)).slice(0, 5)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      setUnlocks(top);
      setPatternOn(top.some((e) => e.source === "pattern"));
    }).catch(() => {});
    fetch("/api/news?limit=5").then((r) => r.json()).then((d) => setNews(d.ok ? d : { items: [] })).catch(() => setNews({ items: [] }));
    createClient()
      .from("rounds")
      .select("raised_usd, starts_at, ends_at")
      .eq("approval_status", "approved")
      .then(({ data }) => {
        if (!data) return;
        const now = Date.now();
        setLp({
          raised: data.reduce((s, r) => s + Number(r.raised_usd), 0),
          live: data.filter((r) => new Date(r.starts_at) <= now && new Date(r.ends_at) >= now).length,
          total: data.length,
        });
      });
  }, []);

  return (
    <>
      <SiteHeader />
      <main className="home">
        <section className="hero">
          <div>
            <h1>Track the market. Back the next launch.</h1>
            <p>Live prices, trending and newly listed tokens, token unlocks, and a KYC-verified private-sale launchpad — one place.</p>
          </div>
          <div className="hero__cta">
            <Link href="/launchpad" className="btn btn--primary">Explore Launchpad</Link>
            <Link href="/launchpad/apply-investor" className="btn">Apply as Investor</Link>
          </div>
        </section>

        <section className="grid">
          <Card title="🔥 Trending" href="/?tab=trending">
            {trending.length === 0 && <span className="mute">Loading…</span>}
            {trending.map((c) => (
              <Row key={c.id} left={<>{c.image && <img src={c.image} alt="" width="20" height="20" style={{ borderRadius: "50%" }} />}<b>{c.symbol}</b></>}
                right={c.change24h != null ? fmtPct(c.change24h) : "—"} rightColor={c.change24h >= 0 ? "var(--lp-signal-green)" : "var(--lp-signal-red)"} />
            ))}
          </Card>
          <Card title="🆕 New Pairs" href="/?tab=new">
            {fresh.length === 0 && <span className="mute">Loading…</span>}
            {fresh.map((c) => (
              <Row key={c.id} left={<><b>{c.symbol}</b></>} sub={c.chain} right={fmtUsd(c.liquidity)} />
            ))}
          </Card>
          <Card title="🔓 Upcoming Unlocks" href="/unlocks" credit={patternOn ? { text: "Data: PatternPlus", href: "https://pattern.plus" } : null}>
            {unlocks.length === 0 && <span className="mute">No upcoming events yet.</span>}
            {unlocks.map((e) => (
              <Row key={e.key} left={<b>{e.symbol || e.name}</b>} sub={e.valueUsd ? fmtUsd(e.valueUsd) : e.tokens ? `${fmtNum(e.tokens)} tokens` : null}
                right={new Date(e.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })} />
            ))}
          </Card>
          <Card title="🚀 Launchpad" href="/launchpad">
            {lp ? (
              <>
                <Row left="Total raised" right={<b>{fmtUsd(lp.raised)}</b>} />
                <Row left="Projects / rounds" right={<b>{lp.total}</b>} />
                <Row left="Open now" right={<b>{lp.live}</b>} />
              </>
            ) : <span className="mute">Loading…</span>}
          </Card>
          <Card wide title="📰 Latest News" href="/news" credit={news?.provider ? { text: `News via ${news.provider}`, href: news.providerUrl } : null}>
            {news === null && <span className="mute">Loading…</span>}
            {news && news.items.length === 0 && <span className="mute">News is unavailable right now.</span>}
            {news && news.items.slice(0, 5).map((n) => (
              <a key={n.id} className="newsrow" href={n.url} target="_blank" rel="noopener noreferrer nofollow">
                <span>{n.title}</span>
                <small>{n.source}</small>
              </a>
            ))}
          </Card>
        </section>

        <MarketsTerminal />

        <TokenSection />

        <section className="svc">
          <div className="svc__head">
            <h2>Need a listing, investors or a launch?</h2>
            <Link href="/services" className="btn btn--primary">See all services</Link>
          </div>
          <div className="svc__grid">
            {SERVICES.map((s) => (
              <div key={s.t} className="svc__item"><b>{s.t}</b><span>{s.d}</span></div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />

      <style jsx>{`
        .home { max-width: 1280px; margin: 0 auto; padding: 1.5rem 1.25rem 1rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .hero { display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap; padding: 1.5rem; border-radius: 16px; border: 1px solid var(--lp-line); background: radial-gradient(circle at top right, rgba(55,114,255,0.22), transparent 55%), var(--lp-panel); }
        h1 { margin: 0 0 0.4rem; font-size: clamp(1.5rem, 3.5vw, 2.2rem); font-weight: 800; line-height: 1.15; }
        .hero p { margin: 0; color: var(--lp-mute); max-width: 560px; line-height: 1.55; font-size: 0.95rem; }
        .hero__cta { display: flex; gap: 0.6rem; flex-wrap: wrap; }
        .home :global(.newsrow) { display: flex; flex-direction: column; gap: 0.15rem; color: var(--lp-ink); text-decoration: none; font-size: 0.82rem; line-height: 1.35; }
        .home :global(.newsrow span) { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .home :global(.newsrow small) { color: var(--lp-mute); font-size: 0.7rem; }
        .home :global(.newsrow:hover span) { color: var(--lp-brass-bright); }
        .home :global(.btn) { border: 1px solid var(--lp-line); background: var(--lp-panel-raised); color: var(--lp-ink); font-weight: 600; font-size: 0.86rem; padding: 0.65rem 1.1rem; border-radius: 10px; text-decoration: none; }
        .home :global(.btn--primary) { background: var(--lp-brass); border-color: var(--lp-brass); color: var(--lp-on-accent); }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 0.9rem; }
        .mute { color: var(--lp-mute); font-size: 0.84rem; }
        .svc { border: 1px solid var(--lp-line); border-radius: 16px; background: var(--lp-panel); padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
        .svc__head { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .svc h2 { margin: 0; font-size: 1.15rem; }
        .svc__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem; }
        .svc__item { display: flex; flex-direction: column; gap: 0.25rem; padding: 0.8rem 0.9rem; border-radius: 10px; background: var(--lp-void); border: 1px solid var(--lp-line); }
        .svc__item span { color: var(--lp-mute); font-size: 0.8rem; line-height: 1.45; }
      `}</style>
    </>
  );
}
