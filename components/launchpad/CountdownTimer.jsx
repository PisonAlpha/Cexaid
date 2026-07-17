"use client";

import { useCountdown } from "@/lib/launchpad/useCountdown";

function pad(n) {
  return n.toString().padStart(2, "0");
}

export function CountdownTimer({ target, label }) {
  const { days, hours, minutes, seconds, done } = useCountdown(target);

  return (
    <div className="countdown">
      <span className="countdown__label">{done ? "Closed" : label}</span>
      {!done && (
        <div className="countdown__digits">
          <span>{pad(days)}d</span>
          <span>{pad(hours)}h</span>
          <span>{pad(minutes)}m</span>
          <span>{pad(seconds)}s</span>
        </div>
      )}
      <style jsx>{`
        .countdown {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .countdown__label {
          font-family: var(--lp-font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--lp-mute);
        }
        .countdown__digits {
          display: flex;
          gap: 0.5rem;
          font-family: var(--lp-font-mono);
          font-size: 1.05rem;
          color: var(--lp-ink);
        }
        .countdown__digits span {
          background: var(--lp-panel-raised);
          border: 1px solid var(--lp-line);
          padding: 0.15rem 0.45rem;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}
