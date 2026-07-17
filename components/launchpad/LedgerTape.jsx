"use client";

import { useLaunchpad } from "@/lib/launchpad/LaunchpadContext";

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

export function LedgerTape() {
  const { contributions, projects, rounds } = useLaunchpad();
  const entries = contributions.slice(0, 20);

  const label = (c) => {
    const project = projects.find((p) => p.id === c.projectId);
    const round = rounds.find((r) => r.id === c.roundId);
    return `${project?.name ?? "Project"} · ${round?.title ?? "Round"}`;
  };

  const track = entries.length ? [...entries, ...entries] : [];

  return (
    <div className="ledger-tape">
      <div className="ledger-tape__label">
        <span className="ledger-dot" />
        LIVE LEDGER
      </div>
      <div className="ledger-tape__track">
        <div className="ledger-tape__scroll">
          {track.map((c, i) => (
            <span className="ledger-tape__entry" key={`${c.id}-${i}`}>
              {c.wallet} · ${c.amountUSD.toLocaleString()} · {label(c)} · {timeAgo(c.timestamp)}
              <span className="ledger-tape__sep">/</span>
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .ledger-tape {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border: 1px solid var(--lp-line);
          background: var(--lp-panel);
          border-radius: 2px;
          padding: 0.5rem 0.75rem;
          overflow: hidden;
        }
        .ledger-tape__label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--lp-font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          color: var(--lp-brass);
          flex-shrink: 0;
          padding-right: 0.75rem;
          border-right: 1px solid var(--lp-line);
        }
        .ledger-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--lp-signal-green);
          box-shadow: 0 0 6px var(--lp-signal-green);
        }
        .ledger-tape__track {
          overflow: hidden;
          flex: 1;
        }
        .ledger-tape__scroll {
          display: inline-flex;
          white-space: nowrap;
          animation: ledger-scroll 40s linear infinite;
        }
        .ledger-tape__entry {
          font-family: var(--lp-font-mono);
          font-size: 0.75rem;
          color: var(--lp-mute);
          padding-right: 1rem;
        }
        .ledger-tape__sep {
          color: var(--lp-line);
          padding-left: 1rem;
        }
        @keyframes ledger-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ledger-tape__scroll {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
