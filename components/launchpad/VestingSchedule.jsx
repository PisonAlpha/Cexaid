export function VestingSchedule({ steps }) {
  return (
    <div className="vesting">
      {steps.map((step, i) => (
        <div className="vesting__step" key={step.label}>
          <span className="vesting__index">{String(i + 1).padStart(2, "0")}</span>
          <span className="vesting__label">{step.label}</span>
          <span className="vesting__percent">
            {step.percent > 0 ? `${step.percent}%` : "—"}
          </span>
        </div>
      ))}
      <style jsx>{`
        .vesting {
          display: flex;
          flex-direction: column;
        }
        .vesting__step {
          display: grid;
          grid-template-columns: 2.5rem 1fr auto;
          align-items: center;
          padding: 0.65rem 0;
          border-bottom: 1px solid var(--lp-line);
          font-family: var(--lp-font-mono);
        }
        .vesting__step:last-child {
          border-bottom: none;
        }
        .vesting__index {
          color: var(--lp-brass);
          font-size: 0.72rem;
        }
        .vesting__label {
          color: var(--lp-ink);
          font-size: 0.85rem;
        }
        .vesting__percent {
          color: var(--lp-mute);
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
}
