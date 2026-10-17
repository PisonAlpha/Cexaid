import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { TOKEN } from "@/lib/token/content";

export const metadata = { title: "CEXAID Token | CEXAID" };

const TBA = <span style={{ color: "var(--lp-mute)" }}>To be announced</span>;
const fmt = (n) => (n == null ? TBA : Number(n).toLocaleString());
const STATUS = { live: "Live", "in-progress": "In progress", planned: "Planned" };

const vestText = (v) => {
  if (!v) return null;
  const parts = [];
  parts.push(v.tge > 0 ? `${v.tge}% at launch` : "0% at launch");
  if (v.cliff > 0) parts.push(`${v.cliff}-month cliff`);
  if (v.tge < 100) parts.push(`${v.linear}-month linear`);
  return parts.join(", ");
};
// % of a category unlocked `m` months after launch.
const unlocked = (v, m) => {
  if (!v) return 0;
  if (m <= v.cliff) return v.tge;
  return v.tge + (100 - v.tge) * Math.min((m - v.cliff) / Math.max(v.linear, 1), 1);
};
const MONTHS = [0, 3, 6, 12, 18, 24, 36, 48, 54];

export default function TokenPage() {
  const t = TOKEN;
  const tk = t.tokenomics;
  const initialPct = tk.initialCirculatingPercent;
  const initialTokens = initialPct != null && tk.totalSupply ? Math.round((tk.totalSupply * initialPct) / 100) : null;
  const allPct = tk.allocation.length > 0 && tk.allocation.every((a) => a.percent != null);
  const sumPct = tk.allocation.reduce((s, a) => s + (a.percent || 0), 0);
  const tgeSum = tk.allocation.reduce((sum, a) => sum + ((a.percent || 0) * (a.vest?.tge || 0)) / 100, 0);
  const circ = (m) => tk.allocation.reduce((sum, a) => sum + ((a.percent || 0) * unlocked(a.vest, m)) / 100, 0);
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
            <div><span>Initial circulating</span><b>{initialPct != null ? `${initialPct}% (${fmt(initialTokens)} ${t.ticker || ""})` : TBA}</b></div>
            <div><span>Chain</span><b>{tk.chain || TBA}</b></div>
          </div>

          <div className="dist">
            <div className="dist__row dist__row--head"><span>Category</span><span className="r">Allocation</span><span className="r">Tokens</span><span>Vesting</span></div>
            {tk.allocation.map((a) => (
              <div key={a.label} className="dist__row">
                <span>{a.label}</span>
                <span className="r">{a.percent != null ? `${a.percent}%` : TBA}</span>
                <span className="r">{a.percent != null && tk.totalSupply ? fmt(Math.round((tk.totalSupply * a.percent) / 100)) : TBA}</span>
                <span>{a.vest ? vestText(a.vest) : TBA}</span>
              </div>
            ))}
          </div>
          {allPct && sumPct === 100 && (
            <div className="alloc" style={{ marginTop: "1.1rem" }}>
              {tk.allocation.map((a) => (
                <div key={a.label} className="alloc__row"><span>{a.label}</span><div className="bar"><i style={{ width: `${a.percent}%` }} /></div><span className="r">{a.percent}%</span></div>
              ))}
            </div>
          )}
          {allPct && Math.abs(tgeSum - initialPct) > 0.001 && <p className="note">Note: launch unlocks add up to {tgeSum}%, not {initialPct}%.</p>}

          {allPct && (
            <>
              <h3 className="sub">Projected circulating supply</h3>
              <p className="note">Based on the vesting schedules above, measured from launch. Illustrative: it excludes any burns or buybacks and changes if the schedules change.</p>
              <div className="dist">
                <div className="dist__row dist__row--head dist__row--circ"><span>Months after launch</span><span className="r">Circulating</span><span className="r">Tokens</span></div>
                {MONTHS.map((m) => {
                  const pct = circ(m);
                  return (
                    <div key={m} className="dist__row dist__row--circ">
                      <span>{m === 0 ? "At launch" : `Month ${m}`}</span>
                      <span className="r">{pct.toFixed(pct % 1 === 0 ? 0 : 1)}%</span>
                      <span className="r">{fmt(Math.round((tk.totalSupply * pct) / 100))}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          {allPct && sumPct !== 100 && <p className="note">Note: allocation percentages currently add up to {sumPct}%, not 100%.</p>}

          {tk.notIncluded?.length > 0 && (
            <p className="body" style={{ marginTop: "0.9rem" }}>
              <b style={{ color: "var(--lp-ink)" }}>Not part of CXD&apos;s distribution:</b> {tk.notIncluded.join(" · ")}.
            </p>
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
        .tk .dist { border: 1px solid var(--lp-line); border-radius: 12px; background: var(--lp-panel); overflow-x: auto; }
        .tk .dist__row { display: grid; grid-template-columns: 1.4fr 0.8fr 1fr 1.2fr; gap: 0.8rem; padding: 0.7rem 1rem; border-bottom: 1px solid var(--lp-line); font-size: 0.88rem; min-width: 560px; }
        .tk .dist__row:last-child { border-bottom: 0; }
        .tk .dist__row--head { color: var(--lp-mute); font-size: 0.74rem; }
        .tk .r { text-align: right; }
        .tk .dist__row--circ { grid-template-columns: 1.4fr 0.8fr 1fr; min-width: 420px; }
        .tk .sub { margin: 1.4rem 0 0.4rem; font-size: 1.05rem; }
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
