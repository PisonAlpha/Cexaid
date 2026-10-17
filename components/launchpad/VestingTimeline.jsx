"use client";

// Unlock curve drawn from the contract's own parameters (TGE %, cliff, linear vesting).
export function VestingTimeline({ tgeTime, tgeBps, cliffSeconds, vestingSeconds, symbol }) {
  const tge = Number(tgeTime) * 1000;
  const tgePct = Number(tgeBps) / 100;
  const cliffMs = Number(cliffSeconds) * 1000;
  const vestMs = Number(vestingSeconds) * 1000;
  const cliffEnd = tge + cliffMs;
  const end = cliffEnd + vestMs;
  const now = Date.now();
  const span = Math.max(end - tge, 1);

  const unlockedAt = (t) => {
    if (t < tge) return 0;
    if (vestMs === 0) return 100;
    if (t <= cliffEnd) return tgePct;
    if (t >= end) return 100;
    return tgePct + ((100 - tgePct) * (t - cliffEnd)) / vestMs;
  };

  // chart geometry: a little lead-in before TGE so the first jump is visible
  const W = 640, H = 220, L = 42, R = 14, T = 12, B = 30;
  const t0 = tge - span * 0.08;
  const t1 = end + span * 0.04;
  const x = (t) => L + ((t - t0) / (t1 - t0)) * (W - L - R);
  const y = (p) => T + (1 - p / 100) * (H - T - B);
  const pts = [[t0, 0], [tge - 1, 0], [tge, tgePct]];
  if (cliffMs > 0) pts.push([cliffEnd, tgePct]);
  if (vestMs > 0) pts.push([end, 100]);
  pts.push([t1, 100]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${x(p[0]).toFixed(1)},${y(p[1]).toFixed(1)}`).join(" ");
  const area = `${line} L${x(t1)},${y(0)} L${x(t0)},${y(0)} Z`;
  const nowIn = now > t0 && now < t1;
  const fmt = (t) => new Date(t).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

  const rows = [
    { label: "TGE · claiming opens", at: tge, pct: tgePct },
    ...(cliffMs > 0 ? [{ label: "Cliff ends", at: cliffEnd, pct: tgePct }] : []),
    ...(vestMs > 0 ? [{ label: "Fully unlocked", at: end, pct: 100 }] : []),
  ];

  return (
    <div className="vt">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Token unlock schedule">
        {[0, 25, 50, 75, 100].map((p) => (
          <g key={p}>
            <line x1={L} x2={W - R} y1={y(p)} y2={y(p)} stroke="var(--lp-line)" />
            <text x={L - 6} y={y(p) + 3} textAnchor="end" fontSize="9" fill="var(--lp-mute)">{p}%</text>
          </g>
        ))}
        <path d={area} fill="var(--lp-brass)" opacity="0.14" />
        <path d={line} fill="none" stroke="var(--lp-brass-bright)" strokeWidth="2.5" />
        {rows.map((r) => (
          <g key={r.label}>
            <circle cx={x(r.at)} cy={y(r.pct)} r="4" fill="var(--lp-void)" stroke="var(--lp-brass-bright)" strokeWidth="2" />
          </g>
        ))}
        {nowIn && (
          <g>
            <line x1={x(now)} x2={x(now)} y1={T} y2={H - B} stroke="var(--lp-signal-green)" strokeDasharray="4 3" />
            <text x={x(now)} y={H - B + 14} textAnchor="middle" fontSize="9" fill="var(--lp-signal-green)">Today · {unlockedAt(now).toFixed(0)}%</text>
          </g>
        )}
      </svg>
      <div className="vt__rows">
        {rows.map((r) => (
          <div key={r.label} className="vt__row">
            <span>{r.label}</span>
            <span>{fmt(r.at)}</span>
            <b>{r.pct % 1 ? r.pct.toFixed(1) : r.pct}% of {symbol || "tokens"} unlocked</b>
          </div>
        ))}
      </div>
      <p className="vt__note">
        {vestMs > 0 ? "After the cliff the remainder unlocks continuously, second by second." : "Everything unlocks at TGE."} This schedule is
        fixed in the contract. Nobody, including CEXAID and the founder, can change it.
      </p>
      <style jsx>{`
        .vt { font-family: var(--lp-font-body); display: flex; flex-direction: column; gap: 0.8rem; }
        .vt__rows { display: flex; flex-direction: column; }
        .vt__row { display: grid; grid-template-columns: 1.3fr 1fr 1.5fr; gap: 0.6rem; padding: 0.5rem 0; border-bottom: 1px solid var(--lp-line); font-size: 0.82rem; color: var(--lp-mute); }
        .vt__row b { color: var(--lp-ink); font-weight: 600; }
        .vt__note { margin: 0; font-size: 0.78rem; color: var(--lp-mute); line-height: 1.6; }
        @media (max-width: 600px) { .vt__row { grid-template-columns: 1fr; gap: 0.1rem; } }
      `}</style>
    </div>
  );
}
