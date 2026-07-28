"use client";

import { useState } from "react";

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button type="button" onClick={handleCopy} className="copy-link">
      {copied ? "Link copied ✓" : "Copy share link"}

      <style jsx>{`
        .copy-link {
          font-family: var(--lp-font-mono);
          font-size: 0.75rem;
          color: var(--lp-brass);
          background: transparent;
          border: 1px solid var(--lp-brass);
          border-radius: 2px;
          padding: 0.5rem 0.9rem;
          cursor: pointer;
          white-space: nowrap;
        }
        .copy-link:hover {
          background: var(--lp-brass);
          color: var(--lp-void);
        }
      `}</style>
    </button>
  );
}
