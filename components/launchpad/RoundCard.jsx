import { ProgressBar } from "./ProgressBar";
import { CountdownTimer } from "./CountdownTimer";

const STATUS_LABEL = {
  live: "Open now",
  upcoming: "Opens soon",
  filled: "Filled",
  closed: "Closed",
};

// Embedded summary block for a round - used inside a project's page
// alongside its full contribute form, vesting schedule, etc.
export function RoundCard({ round }) {
  return (
    <div className="round-card">
      <div className="round-card__head">
        <span className="round-card__number">Round {String(round.roundNumber).padStart(2, "0")}</span>
        <span className={`round-card__status round-card__status--${round.status}`}>
          {STATUS_LABEL[round.status]}
        </span>
      </div>

      <h3 className="round-card__title">{round.title}</h3>
      {round.tagline && <p className="round-card__tagline">{round.tagline}</p>}

      <div className="round-card__stats">
        <div>
          <span className="round-card__stat-label">Price</span>
          <span className="round-card__stat-value">
            ${round.tokenPriceUSD} / {round.tokenSymbol}
          </span>
        </div>
        <div>
          <span className="round-card__stat-label">Ticket</span>
          <span className="round-card__stat-value">
            ${round.minTicketUSD.toLocaleString()}–${round.maxTicketUSD.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="round-card__stat-label">Access</span>
          <span className="round-card__stat-value">
            {round.requiresApproval ? "Approved investors" : "Open to all"}
          </span>
        </div>
        <div>
          <span className="round-card__stat-label">Chain</span>
          <span className="round-card__stat-value">{round.chain || "BNB Chain"}</span>
        </div>
      </div>

      <ProgressBar raised={round.raisedUSD} total={round.totalAllocationUSD} />

      <div className="round-card__foot">
        <CountdownTimer
          target={round.status === "upcoming" ? round.startsAt : round.endsAt}
          label={round.status === "upcoming" ? "Starts in" : "Closes in"}
        />
      </div>

      <style jsx>{`
        .round-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: var(--lp-panel);
          border: 1px solid var(--lp-line);
          border-radius: 3px;
          padding: 1.5rem;
        }
        .round-card__head {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .round-card__number {
          font-family: var(--lp-font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          color: var(--lp-brass);
        }
        .round-card__status {
          font-family: var(--lp-font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.15rem 0.5rem;
          border-radius: 2px;
          border: 1px solid var(--lp-line);
          color: var(--lp-mute);
        }
        .round-card__status--live {
          color: var(--lp-signal-green);
          border-color: var(--lp-signal-green);
        }
        .round-card__status--closed,
        .round-card__status--filled {
          color: var(--lp-mute);
          border-color: var(--lp-line);
        }
        .round-card__title {
          font-family: var(--lp-font-display);
          font-size: 1.4rem;
          font-weight: 600;
          color: var(--lp-ink);
          margin: 0;
        }
        .round-card__tagline {
          font-family: var(--lp-font-body);
          font-size: 0.9rem;
          color: var(--lp-mute);
          margin: 0;
          line-height: 1.5;
        }
        .round-card__stats {
          display: flex;
          gap: 1.5rem;
          padding: 0.9rem 0;
          border-top: 1px solid var(--lp-line);
          border-bottom: 1px solid var(--lp-line);
        }
        .round-card__stats > div {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .round-card__stat-label {
          font-family: var(--lp-font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--lp-mute);
        }
        .round-card__stat-value {
          font-family: var(--lp-font-mono);
          font-size: 0.85rem;
          color: var(--lp-ink);
        }
      `}</style>
    </div>
  );
}
