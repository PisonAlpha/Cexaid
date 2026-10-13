"use client";

import { useState } from "react";
import Link from "next/link";
import { useLaunchpad } from "@/lib/launchpad/LaunchpadContext";

function Row({ project, round, onSaved }) {
  const [cg, setCg] = useState(project.coingeckoId || "");
  const [addr, setAddr] = useState(project.contractAddress || "");
  const [tge, setTge] = useState(round?.tgeDate ? round.tgeDate.slice(0, 10) : "");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/market-links", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, coingeckoId: cg, contractAddress: addr, roundId: round?.id, tgeDate: tge || null }),
      });
      const data = await res.json();
      setMsg(data.ok ? "Saved ✓" : data.error || "Failed");
      if (data.ok) onSaved();
    } catch {
      setMsg("Failed to save");
    }
    setBusy(false);
  };

  return (
    <div className="ml">
      <h3>{project.name} {round && <span>({round.tokenSymbol})</span>}</h3>
      <div className="ml__grid">
        <label>CoinGecko id<input value={cg} onChange={(e) => setCg(e.target.value)} placeholder="e.g. my-token (from the coin's CoinGecko URL)" /></label>
        <label>Token contract (fallback via DexScreener)<input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="0x…" /></label>
        <label>TGE date (starts the unlock calendar)<input type="date" value={tge} onChange={(e) => setTge(e.target.value)} /></label>
      </div>
      <button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</button> <span className="ml__msg">{msg}</span>
      <style jsx>{`
        .ml { background: var(--lp-panel); border: 1px solid var(--lp-line); border-radius: 12px; padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: 0.75rem; }
        h3 { margin: 0; font-size: 1rem; } h3 span { color: var(--lp-mute); font-weight: 400; }
        .ml__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.75rem; }
        label { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.74rem; color: var(--lp-mute); }
        input { background: var(--lp-void); border: 1px solid var(--lp-line); color: var(--lp-ink); border-radius: 8px; padding: 0.55rem 0.7rem; font: 0.85rem var(--lp-font-body); }
        button { align-self: flex-start; background: var(--lp-brass); color: var(--lp-on-accent); border: 0; border-radius: 8px; padding: 0.5rem 1rem; font-weight: 600; cursor: pointer; }
        .ml__msg { font-size: 0.8rem; color: var(--lp-mute); }
      `}</style>
    </div>
  );
}

export default function MarketLinksPage() {
  const { projects, rounds, refresh, loaded } = useLaunchpad();
  const list = projects.filter((p) => !p.isDemo);

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "1.5rem 1.25rem 4rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Link href="/launchpad/admin" style={{ color: "var(--lp-mute)", fontSize: "0.8rem", textDecoration: "none" }}>← Admin dashboard</Link>
      <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Market links &amp; TGE dates</h1>
      <p style={{ margin: 0, color: "var(--lp-mute)", fontSize: "0.88rem", lineHeight: 1.55 }}>
        Once a project&apos;s token is trading, add its CoinGecko id (or contract address) to show live price and ROI on the launchpad.
        Set the TGE date to publish its unlock schedule on the Unlock Calendar.
      </p>
      {!loaded && <p style={{ color: "var(--lp-mute)" }}>Loading…</p>}
      {list.map((p) => {
        const round = rounds.filter((r) => r.projectId === p.id).sort((a, b) => a.roundNumber - b.roundNumber).at(-1);
        return <Row key={p.id} project={p} round={round} onSaved={refresh} />;
      })}
    </main>
  );
}
