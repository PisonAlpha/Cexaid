"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fmtUsd, fmtPct } from "@/lib/market/format";
import { LogoMark } from "@/components/site/LogoMark";

const MENU = [
  {
    label: "Markets",
    items: [
      { href: "/", title: "All Coins", desc: "Live prices, market cap, volume and 7-day charts for the top 1,000 assets." },
      { href: "/?tab=trending", title: "Trending", desc: "The coins people are searching for right now." },
      { href: "/?tab=new", title: "New Pairs", desc: "Newly listed and created tokens across chains (high risk)." },
      { href: "/unlocks", title: "Token Unlocks", desc: "Upcoming unlocks across the market plus CEXAID private rounds." },
      { href: "/news", title: "Crypto News", desc: "Live headlines from across the crypto press, linked to the original sources." },
    ],
  },
  {
    label: "Launchpad",
    items: [
      { href: "/launchpad", title: "Private Sales", desc: "Ongoing and concluded rounds with vesting, contributors and ROI." },
      { href: "/launchpad/apply-investor", title: "Investor Access", desc: "Apply once, get approved, join every private sale." },
      { href: "/launchpad/kyc", title: "Founder KYC", desc: "Verify your team to list a project." },
      { href: "/launchpad/apply-private-sale", title: "Apply for a Private Sale", desc: "Submit your round for CEXAID review." },
      { href: "/launchpad/create-token", title: "Create a Token", desc: "Standard or tax token on BNB Chain. No CEXAID fee, you pay only gas." },
    ],
  },
  {
    label: "Services",
    items: [
      { href: "/services", title: "CEX Listing", desc: "Exchange readiness, documentation and positioning." },
      { href: "/services", title: "VC & Investor Network", desc: "Introductions, pitch prep and fundraising strategy." },
      { href: "/services", title: "Early-Stage Funding", desc: "Seed support, incubation and expansion advisory." },
    ],
  },
  {
    label: "Token",
    items: [
      { href: "/token", title: "CEXAID Token", desc: "About the planned CEXAID utility token." },
      { href: "/token#tokenomics", title: "Tokenomics", desc: "Supply, allocation and vesting." },
      { href: "/token#roadmap", title: "Roadmap", desc: "What we are building and when." },
      { href: "/token#documents", title: "Whitepaper & Pitch Deck", desc: "Documents about the token." },
    ],
  },
  {
    label: "Company",
    items: [
      { href: "/", title: "Home", desc: "Back to the CEXAID homepage." },
      { href: "/about", title: "Team & Contact", desc: "Who is behind CEXAID and how to reach us." },
      { href: "/terms", title: "Terms of Service", desc: "Rules for investors and founders." },
      { href: "/privacy", title: "Privacy Policy", desc: "How we handle your data." },
    ],
  },
];

function StatsBar() {
  const [g, setG] = useState(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/market/global")
      .then((r) => r.json())
      .then((d) => alive && d.ok && setG(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  if (!g || g.marketCap == null) return <div className="stats stats--empty" />;
  const ch = g.marketCapChange24h;
  return (
    <div className="stats">
      <div className="stats__inner">
        <span>Market Cap <b>{fmtUsd(g.marketCap)}</b> <em className={ch >= 0 ? "up" : "down"}>{fmtPct(ch)}</em></span>
        <span>24h Vol <b>{fmtUsd(g.volume24h)}</b></span>
        {g.btcDominance != null && <span>BTC Dominance <b>{g.btcDominance.toFixed(1)}%</b></span>}
        {g.fearGreed != null && <span>Fear &amp; Greed <b>{g.fearGreed}</b> <small>{g.fearGreedLabel}</small></span>}
        {g.coins != null && <span className="hide-sm">Coins <b>{g.coins.toLocaleString()}</b></span>}
      </div>
      <style jsx>{`
        .stats { background: var(--lp-void); border-bottom: 1px solid var(--lp-line); }
        .stats--empty { height: 0; border: 0; }
        .stats__inner { max-width: 1280px; margin: 0 auto; padding: 0.45rem 1.25rem; display: flex; gap: 1.5rem; overflow-x: auto; white-space: nowrap; font-size: 0.74rem; color: var(--lp-mute); scrollbar-width: none; }
        b { color: var(--lp-ink); font-weight: 600; }
        small { color: var(--lp-mute); }
        em { font-style: normal; }
        .up { color: var(--lp-signal-green); }
        .down { color: var(--lp-signal-red); }
        @media (max-width: 640px) { .hide-sm { display: none; } }
      `}</style>
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState(null);

  return (
    <header className="sh">
      <StatsBar />
      <nav className="sh__nav">
        <Link href="/" className="sh__logo"><LogoMark size={28} /><b>CEX<span>AID</span></b></Link>

        <ul className="sh__menu">
          {MENU.map((m) => (
            <li key={m.label} className="sh__item">
              <button type="button" className="sh__top" aria-haspopup="true">{m.label} <span aria-hidden="true">▾</span></button>
              <div className="sh__drop">
                {m.items.map((it) => (
                  <Link key={it.title} href={it.href} className="sh__drop-link">
                    <strong>{it.title}</strong>
                    <span>{it.desc}</span>
                  </Link>
                ))}
              </div>
            </li>
          ))}
        </ul>

        <div className="sh__right">
          <Link href="/launchpad/apply-investor" className="sh__cta">Apply as Investor</Link>
          <button type="button" className="sh__burger" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            <i className={open ? "x1" : ""} /><i className={open ? "x2" : ""} /><i className={open ? "x3" : ""} />
          </button>
        </div>
      </nav>

      {open && (
        <div className="sh__mobile">
          {MENU.map((m) => (
            <div key={m.label}>
              <button type="button" className="sh__m-top" onClick={() => setSub(sub === m.label ? null : m.label)}>
                {m.label} <span>{sub === m.label ? "−" : "+"}</span>
              </button>
              {sub === m.label &&
                m.items.map((it) => (
                  <Link key={it.title} href={it.href} className="sh__m-link" onClick={() => setOpen(false)}>{it.title}</Link>
                ))}
            </div>
          ))}
          <Link href="/launchpad/apply-investor" className="sh__cta sh__cta--block" onClick={() => setOpen(false)}>Apply as Investor</Link>
        </div>
      )}

      <style jsx>{`
        .sh { position: sticky; top: 0; z-index: 50; background: rgba(9, 11, 16, 0.92); backdrop-filter: blur(12px); border-bottom: 1px solid var(--lp-line); }
        .sh__nav { max-width: 1280px; margin: 0 auto; padding: 0.7rem 1.25rem; display: flex; align-items: center; gap: 1.5rem; }
        :global(.sh__logo) { display: inline-flex; align-items: center; gap: 0.5rem; font-weight: 800; font-size: 1.35rem; letter-spacing: 0.02em; color: var(--lp-ink); text-decoration: none; }
        :global(.sh__logo) b { font-weight: 800; }
        :global(.sh__logo) span { color: var(--lp-brass); }
        .sh__menu { display: flex; gap: 0.25rem; list-style: none; margin: 0; padding: 0; flex: 1; }
        .sh__item { position: relative; }
        .sh__top { background: none; border: 0; color: var(--lp-ink); font: 500 0.88rem var(--lp-font-body); padding: 0.55rem 0.8rem; border-radius: 8px; cursor: pointer; }
        .sh__top span { font-size: 0.65rem; color: var(--lp-mute); }
        .sh__item:hover .sh__top, .sh__item:focus-within .sh__top { background: var(--lp-panel-raised); }
        .sh__drop { display: none; position: absolute; top: 100%; left: 0; min-width: 330px; padding: 0.5rem; background: var(--lp-panel); border: 1px solid var(--lp-line); border-radius: 12px; box-shadow: 0 18px 40px rgba(0, 0, 0, 0.5); }
        .sh__item:hover .sh__drop, .sh__item:focus-within .sh__drop { display: block; }
        .sh__drop :global(.sh__drop-link) { display: flex; flex-direction: column; gap: 0.15rem; padding: 0.65rem 0.8rem; border-radius: 8px; text-decoration: none; }
        .sh__drop :global(.sh__drop-link:hover) { background: var(--lp-panel-raised); }
        .sh__drop :global(strong) { color: var(--lp-ink); font-size: 0.88rem; font-weight: 600; }
        .sh__drop :global(span) { color: var(--lp-mute); font-size: 0.76rem; line-height: 1.4; }
        .sh__right { display: flex; align-items: center; gap: 0.75rem; margin-left: auto; }
        :global(.sh__cta) { background: var(--lp-brass); color: var(--lp-on-accent); font-weight: 600; font-size: 0.84rem; padding: 0.55rem 1rem; border-radius: 8px; text-decoration: none; }
        :global(.sh__cta:hover) { background: var(--lp-brass-bright); }
        :global(.sh__cta--block) { display: block; text-align: center; margin-top: 0.75rem; }
        .sh__burger { display: none; width: 40px; height: 40px; flex-direction: column; justify-content: center; gap: 5px; border: 1px solid var(--lp-line); border-radius: 10px; background: transparent; cursor: pointer; }
        .sh__burger i { display: block; width: 18px; height: 2px; margin: 0 auto; background: var(--lp-ink); transition: transform 0.15s, opacity 0.15s; }
        .sh__burger i.x1 { transform: translateY(7px) rotate(45deg); }
        .sh__burger i.x2 { opacity: 0; }
        .sh__burger i.x3 { transform: translateY(-7px) rotate(-45deg); }
        .sh__mobile { display: none; padding: 0.5rem 1.25rem 1.25rem; border-top: 1px solid var(--lp-line); max-height: calc(100vh - 90px); overflow-y: auto; }
        .sh__m-top { width: 100%; display: flex; justify-content: space-between; background: none; border: 0; border-bottom: 1px solid var(--lp-line); color: var(--lp-ink); font: 600 0.95rem var(--lp-font-body); padding: 0.9rem 0; cursor: pointer; }
        .sh__mobile :global(.sh__m-link) { display: block; padding: 0.7rem 0.75rem; color: var(--lp-mute); text-decoration: none; font-size: 0.9rem; }
        @media (max-width: 900px) {
          .sh__menu, .sh__right :global(.sh__cta) { display: none; }
          .sh__burger { display: flex; }
          .sh__mobile { display: block; }
        }
      `}</style>
    </header>
  );
}
