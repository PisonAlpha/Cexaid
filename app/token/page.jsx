import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { TOKEN } from "@/lib/token/content";

export const metadata = { title: "CEXAID Token | CEXAID" };

const TBA = <span style={{ color: "var(--lp-mute)" }}>To be announced</span>;
const fmt = (n) => (n == null ? TBA : Number(n).toLocaleString());
const STATUS = { live: "Live", "in-progress": "In progress", planned: "Planned" };

export default function TokenPage() {
  const t = TOKEN;
  const tk = t.tokenomics;
  return (
    <>
      <SiteHeader />
      <main className="tk">
        <Link href="/" className="back">← Back to Home</Link>

        <section className="hero">
          <span className="pill">{t.status}</span>
          <h1>{t.name}{t.ticker ? <span> ({t.ticker})</span> : null}</h1>
          <p>{t.tagline}</p>
          <nav className="jump">
            <a href="#about">About</a><a href="#utility">Utility</a><a href="#tokenomics">Tokenomics</a><a href="#roadmap">Roadmap</a><a href="#documents">Documents</a>
          </nav>
        </section>

        <section id="about">
          <h2>About</h2>
          {t.about.map((x) => <p key={x} className="body">{x}</p>)}
        </section>

        <section id="utility">
          <h2>Utility</h2>
          <div className="grid">
            {t.utility.map((u) => (
              <div key={u.title} className="card"><b>{u.title}</b><span>{u.desc}</span></div>
            ))}
          </div>
        </section>

        <section id="tokenomics">
          <h2>Tokenomics</h2>
          <div className="facts">
            <div><span>Ticker</span><b>{t.ticker || TBA}</b></div>
            <div><span>Total supply</span><b>{fmt(tk.totalSupply)}</b></div>
            <div><span>Chain</span><b>{tk.chain || TBA}</b></div>
            <div><span>Initial circulating</span><b>{fmt(tk.initialCirculating)}</b></div>
          </div>
          {tk.allocation.length > 0 ? (
            <div className="alloc">
              {tk.allocation.map((a) => (
                <div key={a.label} className="alloc__row">
                  <span>{a.label}</span>
                  <div className="bar"><i style={{ width: `${a.percent}%` }} /></div>
                  <b>{a.percent}%</b>
                </div>
              ))}
            </div>
          ) : (
            <p className="body">The allocation breakdown (community, team, treasury, liquidity, vesting) will be published here once finalised.</p>
          )}
        </section>

        <section id="roadmap">
          <h2>Roadmap</h2>
          <p className="note">{t.roadmapNote}</p>
          <div className="road">
            {t.roadmap.map((r) => (
              <div key={r.phase} className={`step step--${r.status}`}>
                <div className="step__head"><span>{r.phase}</span><em>{STATUS[r.status]}</em></div>
                <b>{r.title}</b>
                <ul>{r.items.map((i) => <li key={i}>{i}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>

        <section id="documents">
          <h2>Documents</h2>
          <div className="grid">
            {t.documents.map((d) => (
              <div key={d.label} className="card">
                <b>{d.label}</b>
                <span>{d.desc}</span>
                {d.url ? (
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="btn">Open {d.label} ↗</a>
                ) : (
                  <span className="btn btn--off">Coming soon</span>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />

      <style>{`
        .tk { max-width: 1000px; margin: 0 auto; padding: 1.5rem 1.25rem 1rem; display: flex; flex-direction: column; gap: 2.25rem; }
        .tk .back { color: var(--lp-mute); font-size: 0.85rem; text-decoration: none; }
        .tk .back:hover { color: var(--lp-brass-bright); }
        .tk .hero { padding: 1.75rem; border-radius: 16px; border: 1px solid var(--lp-line); background: radial-gradient(circle at top right, rgba(55,114,255,0.22), transparent 55%), var(--lp-panel); display: flex; flex-direction: column; gap: 0.8rem; align-items: flex-start; }
        .tk .pill { font-size: 0.74rem; font-weight: 600; padding: 0.3rem 0.7rem; border-radius: 999px; background: rgba(245,196,81,0.1); color: #f5c451; border: 1px solid rgba(245,196,81,0.25); }
        .tk h1 { margin: 0; font-size: clamp(1.8rem, 4vw, 2.6rem); font-weight: 800; }
        .tk h1 span { color: var(--lp-brass-bright); }
        .tk .hero p { margin: 0; color: var(--lp-mute); font-size: 1rem; }
        .tk .jump { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.4rem; }
        .tk .jump a { border: 1px solid var(--lp-line); background: var(--lp-void); color: var(--lp-ink); border-radius: 8px; padding: 0.4rem 0.8rem; font-size: 0.82rem; text-decoration: none; }
        .tk .jump a:hover { border-color: var(--lp-brass); }
        .tk section { scroll-margin-top: 90px; }
        .tk h2 { margin: 0 0 0.9rem; font-size: 1.35rem; }
        .tk .body { color: var(--lp-mute); line-height: 1.7; font-size: 0.95rem; margin: 0 0 0.7rem; max-width: 760px; }
        .tk .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 0.9rem; }
        .tk .card { background: var(--lp-panel); border: 1px solid var(--lp-line); border-radius: 12px; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .tk .card span { color: var(--lp-mute); font-size: 0.86rem; line-height: 1.5; }
        .tk .btn { align-self: flex-start; margin-top: 0.3rem; background: var(--lp-brass); color: var(--lp-on-accent) !important; font-weight: 600; font-size: 0.84rem; padding: 0.5rem 0.9rem; border-radius: 8px; text-decoration: none; }
        .tk .btn--off { background: var(--lp-panel-raised); color: var(--lp-mute) !important; }
        .tk .facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 0.75rem; margin-bottom: 1rem; }
        .tk .facts div { background: var(--lp-panel); border: 1px solid var(--lp-line); border-radius: 12px; padding: 0.85rem 1rem; display: flex; flex-direction: column; gap: 0.25rem; }
        .tk .facts span { color: var(--lp-mute); font-size: 0.76rem; }
        .tk .alloc { display: flex; flex-direction: column; gap: 0.6rem; }
        .tk .alloc__row { display: grid; grid-template-columns: 200px 1fr 52px; gap: 0.8rem; align-items: center; font-size: 0.88rem; }
        .tk .bar { height: 8px; border-radius: 4px; background: var(--lp-line); overflow: hidden; }
        .tk .bar i { display: block; height: 100%; background: var(--lp-brass); }
        .tk .note { color: var(--lp-mute); font-size: 0.82rem; margin: -0.4rem 0 0.9rem; }
        .tk .road { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 0.9rem; }
        .tk .step { background: var(--lp-panel); border: 1px solid var(--lp-line); border-radius: 12px; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .tk .step--live { border-color: rgba(22,199,132,0.45); }
        .tk .step__head { display: flex; justify-content: space-between; font-size: 0.76rem; color: var(--lp-mute); }
        .tk .step__head em { font-style: normal; font-weight: 600; color: var(--lp-brass-bright); }
        .tk .step--live .step__head em { color: var(--lp-signal-green); }
        .tk .step ul { margin: 0; padding-left: 1.1rem; color: var(--lp-mute); font-size: 0.84rem; line-height: 1.7; }
        @media (max-width: 600px) { .tk .alloc__row { grid-template-columns: 1fr 60px; } .tk .alloc__row .bar { grid-column: 1 / -1; order: 3; } }
      `}</style>
    </>
  );
}
