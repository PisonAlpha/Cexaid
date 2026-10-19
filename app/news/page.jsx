"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

const PAGE = 30;

function ago(iso) {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function NewsPage() {
  const [data, setData] = useState(null); // null = loading
  const [q, setQ] = useState("");
  const [source, setSource] = useState("all");
  const [shown, setShown] = useState(PAGE);

  const load = useCallback(() => {
    fetch("/api/news?limit=50")
      .then((r) => r.json())
      .then((d) => setData(d.ok ? d : { items: [], error: d.error || "News is unavailable right now." }))
      .catch(() => setData((prev) => prev && prev.items?.length ? prev : { items: [], error: "News is unavailable right now." }));
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, [load]);

  const items = data?.items || [];
  const sources = useMemo(() => [...new Set(items.map((i) => i.source))].sort((a, b) => a.localeCompare(b)), [items]);
  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((i) => (source === "all" || i.source === source) && (!term || i.title.toLowerCase().includes(term)));
  }, [items, q, source]);

  return (
    <>
      <SiteHeader />
      <main className="nw">
        <div className="nw__head">
          <h1>Crypto News</h1>
          <p>
            Latest headlines from across the crypto press. Each headline opens the original article at its source. CEXAID
            does not write, edit or endorse these stories.
          </p>
        </div>

        <div className="nw__bar">
          <input value={q} onChange={(e) => { setQ(e.target.value); setShown(PAGE); }} placeholder="Search headlines" />
          <select value={source} onChange={(e) => { setSource(e.target.value); setShown(PAGE); }} aria-label="Source">
            <option value="all">All sources</option>
            {sources.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {data === null && <p className="nw__mute">Loading headlines…</p>}
        {data && items.length === 0 && <p className="nw__mute">{data.error || "No headlines right now."} Try again in a few minutes.</p>}
        {data && items.length > 0 && list.length === 0 && <p className="nw__mute">No headlines match your search.</p>}

        {list.length > 0 && (
        <ul className="nw__list">
          {list.slice(0, shown).map((n) => (
            <li key={n.id}>
              <a href={n.url} target="_blank" rel="noopener noreferrer nofollow">
                <span className="nw__title">{n.title}</span>
                <span className="nw__meta">
                  {n.icon && <img src={n.icon} alt="" width="14" height="14" loading="lazy" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
                  <b>{n.source}</b> · {ago(n.publishedAt)}
                </span>
              </a>
            </li>
          ))}
        </ul>
        )}

        {list.length > shown && (
          <button type="button" className="nw__more" onClick={() => setShown((n) => n + PAGE)}>Show more</button>
        )}

        {data?.provider && (
          <p className="nw__credit">
            Headlines via <a href={data.providerUrl} target="_blank" rel="noopener noreferrer">{data.provider}</a>
            {data.stale ? " (showing the last update, refresh is delayed)" : ""}. Refreshes every few minutes.
            Headlines are not financial advice.
          </p>
        )}
      </main>
      <SiteFooter />
      <style jsx>{`
        .nw { max-width: 820px; margin: 0 auto; padding: 1.75rem 1.25rem 4rem; display: flex; flex-direction: column; gap: 1rem; }
        h1 { margin: 0 0 0.4rem; font-size: 1.6rem; font-weight: 700; }
        .nw__head p { margin: 0; color: var(--lp-mute); font-size: 0.9rem; line-height: 1.55; max-width: 640px; }
        .nw__bar { display: flex; gap: 0.6rem; flex-wrap: wrap; }
        .nw__bar input, .nw__bar select { background: var(--lp-panel); border: 1px solid var(--lp-line); border-radius: 8px; color: var(--lp-ink); padding: 0.55rem 0.8rem; font: 0.88rem var(--lp-font-body); }
        .nw__bar input { flex: 1; min-width: 200px; }
        .nw__mute { color: var(--lp-mute); font-size: 0.9rem; margin: 0; }
        .nw__list { list-style: none; margin: 0; padding: 0; border: 1px solid var(--lp-line); border-radius: 12px; background: var(--lp-panel); overflow: hidden; }
        .nw__list li { border-bottom: 1px solid var(--lp-line); }
        .nw__list li:last-child { border-bottom: 0; }
        .nw__list a { display: flex; flex-direction: column; gap: 0.3rem; padding: 0.9rem 1.1rem; color: var(--lp-ink); text-decoration: none; }
        .nw__list a:hover { background: var(--lp-panel-raised); }
        .nw__title { font-size: 0.96rem; line-height: 1.4; font-weight: 500; }
        .nw__meta { display: flex; align-items: center; gap: 0.4rem; color: var(--lp-mute); font-size: 0.76rem; }
        .nw__meta :global(img) { border-radius: 3px; }
        .nw__more { align-self: flex-start; background: var(--lp-panel); border: 1px solid var(--lp-line); color: var(--lp-ink); border-radius: 8px; padding: 0.5rem 0.9rem; cursor: pointer; }
        .nw__credit { margin: 0; color: var(--lp-mute); font-size: 0.76rem; line-height: 1.5; }
        .nw__credit a { color: var(--lp-brass-bright); text-decoration: none; }
      `}</style>
    </>
  );
}
