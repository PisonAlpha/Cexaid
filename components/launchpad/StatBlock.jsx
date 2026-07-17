export function StatBlock({ label, value }) {
  return (
    <div className="stat">
      <span className="stat__value">{value}</span>
      <span className="stat__label">{label}</span>
      <style jsx>{`
        .stat {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding-right: 1.5rem;
          border-right: 1px solid var(--lp-line);
        }
        .stat:last-child {
          border-right: none;
          padding-right: 0;
        }
        .stat__value {
          font-family: var(--lp-font-display);
          font-size: 2rem;
          color: var(--lp-ink);
        }
        .stat__label {
          font-family: var(--lp-font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--lp-mute);
        }
      `}</style>
    </div>
  );
}
