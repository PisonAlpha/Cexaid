"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// "Forgot password?" link + inline form. Sends a Supabase reset email whose
// link opens /reset-password, where the user chooses a new password.
export function ForgotPassword({ defaultEmail = "" }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(defaultEmail);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState(null);

  async function send() {
    if (!email) {
      setMessage({ type: "error", text: "Enter your email first." });
      return;
    }
    setStatus("sending");
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setStatus("idle");
    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }
    setMessage({
      type: "ok",
      text: "If an account exists for that email, a reset link is on its way. Open it in this same browser.",
    });
  }

  return (
    <div className="fp">
      {!open ? (
        <button type="button" className="fp__link" onClick={() => setOpen(true)}>
          Forgot password?
        </button>
      ) : (
        <div className="fp__box">
          <span className="fp__title">Reset your password</span>
          <input
            type="email"
            value={email}
            placeholder="Your account email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="fp__row">
            <button type="button" className="fp__send" onClick={send} disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Send reset link"}
            </button>
            <button type="button" className="fp__link" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
          {message && <p className={`fp__msg fp__msg--${message.type}`}>{message.text}</p>}
        </div>
      )}
      <style jsx>{`
        .fp { font-family: var(--lp-font-body); }
        .fp__link { background: none; border: 0; padding: 0; color: var(--lp-brass-bright); font-size: 0.82rem; cursor: pointer; text-decoration: underline; }
        .fp__box { display: flex; flex-direction: column; gap: 0.6rem; border: 1px solid var(--lp-line); background: var(--lp-panel-raised); padding: 0.9rem; border-radius: 4px; }
        .fp__title { font-size: 0.82rem; font-weight: 600; color: var(--lp-ink); }
        .fp__box input { background: var(--lp-void); border: 1px solid var(--lp-line); border-radius: 2px; color: var(--lp-ink); font-size: 0.9rem; padding: 0.55rem 0.7rem; }
        .fp__row { display: flex; align-items: center; gap: 1rem; }
        .fp__send { background: var(--lp-brass); color: var(--lp-on-accent); font-weight: 600; font-size: 0.82rem; border: 0; border-radius: 2px; padding: 0.5rem 0.9rem; cursor: pointer; }
        .fp__send:disabled { background: var(--lp-panel); color: var(--lp-mute); cursor: not-allowed; }
        .fp__msg { margin: 0; font-size: 0.8rem; line-height: 1.5; }
        .fp__msg--ok { color: var(--lp-signal-green); }
        .fp__msg--error { color: var(--lp-signal-red); }
      `}</style>
    </div>
  );
}
