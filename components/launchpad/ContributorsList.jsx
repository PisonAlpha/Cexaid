function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function ContributorsList({ contributions, chain }) {
  return (
    <div className="contributors">
      {contributions.length === 0 && (
        <p className="contributors__empty">No contributions yet.</p>
      )}
      {contributions.map((c) => (
        <div className="contributors__row" key={c.id}>
          <span className="contributors__wallet">
            {c.wallet.slice(0, 6)}…{c.wallet.slice(-4)}
          </span>
          <span className="contributors__amount">${c.amountUSD.toLocaleString()}</span>
          <span className="contributors__time">{timeAgo(c.timestamp)}</span>
          {chain === "BNB Chain" && c.txHash && (
            <a
              href={`https://bscscan.com/tx/${c.txHash}`}
              target="_blank"
              rel="noreferrer"
              className="contributors__tx"
            >
              View tx ↗
            </a>
          )}
        </div>
      ))}

      <style jsx>{`
        .contributors {
          display: flex;
          flex-direction: column;
        }
        .contributors__empty {
          font-family: var(--lp-font-body);
          font-size: 0.85rem;
          color: var(--lp-mute);
          margin: 0;
        }
        .contributors__row {
          display: grid;
          grid-template-columns: 1fr auto auto auto;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0;
          border-bottom: 1px solid var(--lp-line);
          font-family: var(--lp-font-mono);
          font-size: 0.78rem;
        }
        .contributors__row:last-child {
          border-bottom: none;
        }
        .contributors__wallet {
          color: var(--lp-ink);
        }
        .contributors__amount {
          color: var(--lp-brass);
          font-weight: 600;
        }
        .contributors__time {
          color: var(--lp-mute);
        }
        .contributors__tx {
          color: var(--lp-brass);
          text-decoration: none;
        }
        .contributors__tx:hover {
          color: var(--lp-brass-bright);
        }
      `}</style>
    </div>
  );
}
