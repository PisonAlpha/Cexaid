const STATUS_COPY = {
  none: {
    eyebrow: "Investor Status",
    heading: "Not applied",
    detail: "Apply for Private Sale access below.",
  },
  pending: {
    eyebrow: "Investor Status",
    heading: "Application pending",
    detail: "Our team is reviewing your application. This usually takes 1–2 business days.",
  },
  approved: {
    eyebrow: "Investor Status",
    heading: "Approved",
    detail: "You can contribute to any open Private Sale round.",
  },
};

export function InvestorStatus({ status }) {
  const copy = STATUS_COPY[status] ?? STATUS_COPY.none;

  return (
    <div className={`cert cert--${status}`}>
      <div className="cert__corner cert__corner--tl" />
      <div className="cert__corner cert__corner--tr" />
      <div className="cert__corner cert__corner--bl" />
      <div className="cert__corner cert__corner--br" />

      <span className="cert__eyebrow">{copy.eyebrow}</span>
      <h4 className="cert__name">{copy.heading}</h4>
      <span className="cert__seal">SEAL&nbsp;·&nbsp;CEXAID</span>
      <p className="cert__detail">{copy.detail}</p>

      <style jsx>{`
        .cert {
          position: relative;
          background: var(--lp-panel);
          border: 1px solid var(--lp-line);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }
        .cert--approved {
          border-color: var(--lp-brass);
        }
        .cert__corner {
          position: absolute;
          width: 10px;
          height: 10px;
          border: 1px solid var(--lp-brass);
          opacity: 0.6;
        }
        .cert__corner--tl {
          top: 6px;
          left: 6px;
          border-right: none;
          border-bottom: none;
        }
        .cert__corner--tr {
          top: 6px;
          right: 6px;
          border-left: none;
          border-bottom: none;
        }
        .cert__corner--bl {
          bottom: 6px;
          left: 6px;
          border-right: none;
          border-top: none;
        }
        .cert__corner--br {
          bottom: 6px;
          right: 6px;
          border-left: none;
          border-top: none;
        }
        .cert__eyebrow {
          font-family: var(--lp-font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--lp-mute);
        }
        .cert__name {
          font-family: var(--lp-font-display);
          font-size: 1.6rem;
          margin: 0;
          color: var(--lp-brass);
        }
        .cert__seal {
          font-family: var(--lp-font-mono);
          font-size: 0.62rem;
          letter-spacing: 0.1em;
          color: var(--lp-mute);
          border-top: 1px dashed var(--lp-line);
          border-bottom: 1px dashed var(--lp-line);
          padding: 0.35rem 0;
        }
        .cert__detail {
          font-family: var(--lp-font-body);
          font-size: 0.85rem;
          color: var(--lp-ink);
          margin: 0;
        }
      `}</style>
    </div>
  );
}
