"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const EMPTY = { name: "", symbol: "", coingeckoId: "", logoUrl: "", unlockDate: "", tokens: "", percentOfSupply: "", category: "", note: "" };

export default function TokenUnlocksAdmin() {
  const [form, setForm] = useState(EMPTY);
  const [events, setEvents] = useState([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetch("/api/unlocks").then((r) => r.json()).then((d) => d.ok && setEvents(d.events.filter((e) => e.source === "cexaid"))).catch(() => {});
  }, []);
  useEffect(load, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/token-unlocks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await res.json();
      setMsg(d.ok ? "Added ✓" : d.error || "Failed");
      if (d.ok) { setForm(EMPTY); load(); }
    } catch { setMsg("Failed to save"); }
    setBusy(false);
  };

  const del = async (id) => {
    if (!confirm("Delete this unlock event?")) return;
    await fetch(`/api/admin/token-unlocks?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "1.5rem 1.25rem 4rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Link href="/launchpad/admin" style={{ color: "var(--lp-mute)", fontSize: "0.8rem", textDecoration: "none" }}>← Admin dashboard</Link>
      <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Token unlock events</h1>
      <p style={{ margin: 0, color: "var(--lp-mute)", fontSize: "0.88rem", lineHeight: 1.55 }}>
        Add upcoming unlocks for any token. They appear on the public Token Unlock Calendar and the homepage. Use the project&apos;s official tokenomics page as your source.
      </p>

      <form onSubmit={save} className="f">
        <input placeholder="Token name *" value={form.name} onChange={set("name")} required />
        <input placeholder="Symbol *" value={form.symbol} onChange={set("symbol")} required />
        <input type="datetime-local" value={form.unlockDate} onChange={set("unlockDate")} required />
        <input placeholder="Tokens unlocking (number)" value={form.tokens} onChange={set("tokens")} inputMode="decimal" />
        <input placeholder="% of total supply" value={form.percentOfSupply} onChange={set("percentOfSupply")} inputMode="decimal" />
        <input placeholder="Category (Team, Investors, Ecosystem…)" value={form.category} onChange={set("category")} />
        <input placeholder="CoinGecko id (optional)" value={form.coingeckoId} onChange={set("coingeckoId")} />
        <input placeholder="Logo URL (optional)" value={form.logoUrl} onChange={set("logoUrl")} />
        <input placeholder="Note / source link" value={form.note} onChange={set("note")} className="wide" />
        <button disabled={busy}>{busy ? "Saving…" : "Add unlock event"}</button>
        <span className="m">{msg}</span>
        <style jsx>{`
          .f { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.7rem; background: var(--lp-panel); border: 1px solid var(--lp-line); border-radius: 12px; padding: 1rem; align-items: center; }
          input { background: var(--lp-void); border: 1px solid var(--lp-line); color: var(--lp-ink); border-radius: 8px; padding: 0.6rem 0.75rem; font: 0.85rem var(--lp-font-body); }
          .wide { grid-column: 1 / -1; }
          button { background: var(--lp-brass); color: var(--lp-on-accent); border: 0; border-radius: 8px; padding: 0.65rem 1rem; font-weight: 600; cursor: pointer; }
          .m { font-size: 0.8rem; color: var(--lp-mute); }
        `}</style>
      </form>

      <h2 style={{ fontSize: "1.05rem", margin: "0.5rem 0 0" }}>Current events ({events.length})</h2>
      {events.map((e) => (
        <div key={e.key} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", background: "var(--lp-panel)", border: "1px solid var(--lp-line)", borderRadius: 10, padding: "0.7rem 1rem", fontSize: "0.86rem" }}>
          <span><b>{e.name}</b> {e.symbol} · {new Date(e.date).toLocaleString()} {e.category ? `· ${e.category}` : ""}</span>
          <button onClick={() => del(e.id)} style={{ background: "none", border: 0, color: "var(--lp-signal-red)", cursor: "pointer" }}>Delete</button>
        </div>
      ))}
    </main>
  );
}
