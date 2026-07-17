const STATUS_COPY = {
  none: {
    heading: "Not submitted",
    detail: "Submit your KYC details below to apply for listing.",
  },
  pending: {
    heading: "Under review",
    detail: "CEXAID is reviewing your details. This usually takes 1–2 business days.",
  },
  approved: {
    heading: "Approved",
    detail: "You're clear to list a Private Sale round.",
  },
  rejected: {
    heading: "Not approved",
    detail: "Your submission wasn't approved. See the note below, then resubmit.",
  },
};

export function KycStatus({ status, rejectionReason }) {
  const copy = STATUS_COPY[status] ?? STATUS_COPY.none;

  return (
    <div className={`kyc-status kyc-status--${status}`}>
      <span className="kyc-status__eyebrow">Founder KYC</span>
      <h3 className="kyc-status__heading">{copy.heading}</h3>
      <p className="kyc-status__detail">{copy.detail}</p>
      {status === "rejected" && rejectionReason && (
        <p className="kyc-status__reason">Reason: {rejectionReason}</p>
      )}

      <style jsx>{`
        .kyc-status {
          background: var(--lp-panel);
          border: 1px solid var(--lp-line);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .kyc-status--approved {
          border-color: var(--lp-signal-green);
        }
        .kyc-status--rejected {
          border-color: var(--lp-signal-red);
        }
        .kyc-status__eyebrow {
          font-family: var(--lp-font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--lp-mute);
        }
        .kyc-status__heading {
          font-family: var(--lp-font-display);
          font-size: 1.4rem;
          margin: 0;
          color: var(--lp-ink);
        }
        .kyc-status--approved .kyc-status__heading {
          color: var(--lp-signal-green);
        }
        .kyc-status--rejected .kyc-status__heading {
          color: var(--lp-signal-red);
        }
        .kyc-status__detail {
          font-family: var(--lp-font-body);
          font-size: 0.85rem;
          color: var(--lp-mute);
          margin: 0;
        }
        .kyc-status__reason {
          font-family: var(--lp-font-body);
          font-size: 0.82rem;
          color: var(--lp-signal-red);
          margin: 0;
        }
      `}</style>
    </div>
  );
}
