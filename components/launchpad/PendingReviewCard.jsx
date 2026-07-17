const STATUS_COPY = {
  pending_review: {
    heading: "Under CEXAID review",
    detail:
      "Our team reviews every Private Sale submission before it goes public. This typically takes 1–2 business days — no fee is required for this round.",
    tone: "pending",
  },
  approved: {
    heading: "Approved — live",
    detail: "Your Private Sale round is public and accepting applications from approved investors.",
    tone: "approved",
  },
  rejected: {
    heading: "Not approved",
    detail: "This submission wasn't approved. Contact CEXAID for feedback and next steps.",
    tone: "rejected",
  },
};

export function PendingReviewCard({ status }) {
  const copy = STATUS_COPY[status] ?? STATUS_COPY.pending_review;

  return (
    <div className={`review review--${copy.tone}`}>
      <span className="review__eyebrow">Private Sale status</span>
      <h3 className="review__heading">{copy.heading}</h3>
      <p className="review__detail">{copy.detail}</p>

      <style jsx>{`
        .review {
          background: var(--lp-panel);
          border: 1px solid var(--lp-line);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .review--approved {
          border-color: var(--lp-signal-green);
        }
        .review--rejected {
          border-color: var(--lp-signal-red);
        }
        .review__eyebrow {
          font-family: var(--lp-font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--lp-mute);
        }
        .review__heading {
          font-family: var(--lp-font-display);
          font-size: 1.4rem;
          margin: 0;
          color: var(--lp-ink);
        }
        .review--approved .review__heading {
          color: var(--lp-signal-green);
        }
        .review--rejected .review__heading {
          color: var(--lp-signal-red);
        }
        .review__detail {
          font-family: var(--lp-font-body);
          font-size: 0.85rem;
          color: var(--lp-mute);
          margin: 0;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
