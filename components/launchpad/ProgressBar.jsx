export function ProgressBar({ raised, total }) {
  const pct = Math.min(100, (raised / total) * 100);

  return (
    <div className="progress">
      <div className="progress__track">
        <div className="progress__fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="progress__meta">
        <span className="progress__raised">
          ${raised.toLocaleString()} <span className="progress__of">raised</span>
        </span>
        <span className="progress__total">of ${total.toLocaleString()}</span>
      </div>
      <style jsx>{`
        .progress__track {
          height: 6px;
          background: var(--lp-panel-raised);
          border: 1px solid var(--lp-line);
          border-radius: 2px;
          overflow: hidden;
        }
        .progress__fill {
          height: 100%;
          background: linear-gradient(90deg, var(--lp-brass), var(--lp-brass-bright));
          transition: width 0.4s ease;
        }
        .progress__meta {
          display: flex;
          justify-content: space-between;
          margin-top: 0.4rem;
          font-family: var(--lp-font-mono);
          font-size: 0.72rem;
          color: var(--lp-mute);
        }
        .progress__raised {
          color: var(--lp-ink);
          font-weight: 600;
        }
        .progress__of {
          color: var(--lp-mute);
          font-weight: 400;
        }
      `}</style>
    </div>
  );
}
