import Link from "next/link";
import { TOKEN } from "@/lib/token/content";

export function TokenSection() {
  const t = TOKEN;
  const doc = (label) => t.documents.find((d) => d.label === label);
  const tiles = [
    { title: "Tokenomics", desc: "Supply, allocation and vesting.", href: "/token#tokenomics" },
    { title: "Roadmap", desc: "From launchpad to token utility.", href: "/token#roadmap" },
    { title: "Whitepaper", desc: doc("Whitepaper")?.url ? "Read the whitepaper." : "Coming soon.", href: doc("Whitepaper")?.url || "/token#documents", ext: !!doc("Whitepaper")?.url },
    { title: "Pitch Deck", desc: doc("Pitch Deck")?.url ? "View the pitch deck." : "Coming soon.", href: doc("Pitch Deck")?.url || "/token#documents", ext: !!doc("Pitch Deck")?.url },
  ];
  return (
    <section className="ts" id="token">
      <div className="ts__head">
        <div>
          <span className="ts__pill">{t.status}</span>
          <h2>{t.name}</h2>
          <p>{t.about[0]}</p>
        </div>
        <Link href="/token" className="ts__btn">Explore the token →</Link>
      </div>
      <div className="ts__grid">
        {tiles.map((x) => (
          <a key={x.title} href={x.href} {...(x.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="ts__tile">
            <b>{x.title}</b><span>{x.desc}</span>
          </a>
        ))}
      </div>
      <style>{`
        .ts { border: 1px solid var(--lp-line); border-radius: 16px; padding: 1.4rem; display: flex; flex-direction: column; gap: 1.1rem; background: radial-gradient(circle at top left, rgba(55,114,255,0.18), transparent 55%), var(--lp-panel); }
        .ts__head { display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; flex-wrap: wrap; }
        .ts__pill { display: inline-block; font-size: 0.72rem; font-weight: 600; padding: 0.25rem 0.65rem; border-radius: 999px; background: rgba(245,196,81,0.1); color: #f5c451; border: 1px solid rgba(245,196,81,0.25); }
        .ts h2 { margin: 0.6rem 0 0.35rem; font-size: 1.4rem; }
        .ts p { margin: 0; color: var(--lp-mute); font-size: 0.9rem; line-height: 1.55; max-width: 620px; }
        .ts__btn { background: var(--lp-brass); color: var(--lp-on-accent); font-weight: 600; font-size: 0.86rem; padding: 0.65rem 1.1rem; border-radius: 10px; text-decoration: none; }
        .ts__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; }
        .ts__tile { display: flex; flex-direction: column; gap: 0.25rem; padding: 0.85rem 1rem; border-radius: 10px; background: var(--lp-void); border: 1px solid var(--lp-line); text-decoration: none; color: var(--lp-ink); }
        .ts__tile:hover { border-color: var(--lp-brass); }
        .ts__tile span { color: var(--lp-mute); font-size: 0.8rem; }
      `}</style>
    </section>
  );
}
