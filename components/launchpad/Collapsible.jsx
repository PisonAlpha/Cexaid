"use client";

import { useState } from "react";

export function Collapsible({ title, subtitle, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="collapsible">
      <button type="button" className="collapsible__trigger" onClick={() => setOpen((o) => !o)}>
        <div className="collapsible__heading">
          <h4>{title}</h4>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <span className={`collapsible__chevron ${open ? "collapsible__chevron--open" : ""}`}>
          ▾
        </span>
      </button>

      {open && <div className="collapsible__body">{children}</div>}

      <style jsx>{`
        .collapsible {
          background: var(--lp-panel);
          border: 1px solid var(--lp-line);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .collapsible__trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          background: transparent;
          border: none;
          padding: 0;
          margin: 0;
          cursor: pointer;
          text-align: left;
        }
        .collapsible__heading {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .collapsible__heading h4 {
          font-family: var(--lp-font-display);
          font-size: 1.05rem;
          margin: 0;
          color: var(--lp-ink);
        }
        .collapsible__heading p {
          font-family: var(--lp-font-body);
          font-size: 0.8rem;
          color: var(--lp-mute);
          margin: 0;
        }
        .collapsible__chevron {
          font-family: var(--lp-font-mono);
          color: var(--lp-brass);
          font-size: 0.9rem;
          transition: transform 0.15s ease;
          flex-shrink: 0;
        }
        .collapsible__chevron--open {
          transform: rotate(180deg);
        }
        .collapsible__body {
          border-top: 1px solid var(--lp-line);
          padding-top: 1rem;
        }
      `}</style>
    </div>
  );
}
