"use client";

import { useState } from "react";
import { useLaunchpad } from "@/lib/launchpad/LaunchpadContext";

export function InvestorApplicationForm() {
  const { investorUser, submitApplication } = useLaunchpad();
  const [form, setForm] = useState({ name: "", organization: "", note: "", socialHandle: "" });
  const [message, setMessage] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name) {
      setMessage({ type: "error", text: "Name is required." });
      return;
    }
    if (!form.socialHandle || !/twitter\.com|x\.com|linkedin\.com/i.test(form.socialHandle)) {
      setMessage({ type: "error", text: "A real X (Twitter) or LinkedIn profile URL is required." });
      return;
    }
    const result = await submitApplication(form);
    if (result.ok) {
      setSubmitted(true);
      setMessage(null);
    } else {
      setMessage({ type: "error", text: result.error });
    }
  }

  return (
    <form className="apply" onSubmit={handleSubmit}>
      <div className="apply__head">
        <h4>Apply for Private Sale access</h4>
      </div>

      <p className="apply__intro">
        Logged in as <strong>{investorUser?.email}</strong>. We only approve
        real, verifiable applicants — a working X (Twitter) or LinkedIn
        profile is required so our team can confirm who you are before
        approving access.
      </p>

      {submitted ? (
        <p className="apply__submitted">
          Application submitted. You'll be able to contribute (once you also
          connect a wallet) as soon as it's approved.
        </p>
      ) : (
        <>
          <label className="apply__field">
            <span>Full name</span>
            <input type="text" value={form.name} onChange={update("name")} />
          </label>
          <label className="apply__field">
            <span>X (Twitter) or LinkedIn profile URL</span>
            <input
              type="url"
              placeholder="https://x.com/yourhandle or https://linkedin.com/in/yourname"
              value={form.socialHandle}
              onChange={update("socialHandle")}
            />
          </label>
          <label className="apply__field">
            <span>Organization (optional)</span>
            <input type="text" value={form.organization} onChange={update("organization")} />
          </label>
          <label className="apply__field">
            <span>Note (optional)</span>
            <textarea rows={3} value={form.note} onChange={update("note")} />
          </label>

          <button type="submit" className="apply__submit">
            Submit application
          </button>

          {message && <p className="apply__message">{message.text}</p>}
        </>
      )}

      <style jsx>{`
        .apply {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          background: var(--lp-panel);
          border: 1px solid var(--lp-line);
          padding: 1.5rem;
        }
        .apply__head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
        }
        .apply__head h4 {
          font-family: var(--lp-font-display);
          font-size: 1.15rem;
          margin: 0;
          color: var(--lp-ink);
        }
        .apply__intro {
          font-family: var(--lp-font-body);
          font-size: 0.85rem;
          color: var(--lp-mute);
          margin: 0;
          line-height: 1.5;
        }
        .apply__intro strong {
          color: var(--lp-brass);
        }
        .apply__field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-family: var(--lp-font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--lp-mute);
        }
        .apply__field input,
        .apply__field textarea {
          background: var(--lp-panel-raised);
          border: 1px solid var(--lp-line);
          border-radius: 2px;
          color: var(--lp-ink);
          font-family: var(--lp-font-body);
          font-size: 0.9rem;
          padding: 0.6rem 0.75rem;
          resize: vertical;
        }
        .apply__field input:focus,
        .apply__field textarea:focus {
          outline: 2px solid var(--lp-brass);
          outline-offset: 1px;
        }
        .apply__submit {
          background: var(--lp-brass);
          color: var(--lp-void);
          font-weight: 600;
          font-size: 0.9rem;
          padding: 0.7rem 1rem;
          border: none;
          border-radius: 2px;
          cursor: pointer;
        }
        .apply__message {
          font-family: var(--lp-font-body);
          font-size: 0.82rem;
          color: var(--lp-signal-red);
          margin: 0;
        }
        .apply__submitted {
          font-family: var(--lp-font-body);
          font-size: 0.85rem;
          color: var(--lp-signal-green);
          margin: 0;
          line-height: 1.5;
        }
      `}</style>
    </form>
  );
}
