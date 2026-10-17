"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export default function ResetPasswordPage() {
  const [supabase] = useState(() => createClient());
  const [ready, setReady] = useState(false);
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // The reset link signs the user in with a short-lived recovery session.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      setTimeout(() => setChecked(true), 1500);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    if (password.length < 8) return setMessage({ type: "error", text: "Use at least 8 characters." });
    if (password !== confirm) return setMessage({ type: "error", text: "The two passwords do not match." });
    setStatus("saving");
    const { error } = await supabase.auth.updateUser({ password });
    setStatus("idle");
    if (error) return setMessage({ type: "error", text: error.message });
    setMessage({ type: "ok", text: "Password updated. You can now log in with the new password." });
    setPassword("");
    setConfirm("");
    await supabase.auth.signOut();
  }

  const done = message?.type === "ok";

  return (
    <>
      <SiteHeader />
      <main className="rp">
        <div className="rp__card">
          <h1>Choose a new password</h1>
          {!ready && checked && (
            <p className="rp__msg rp__msg--error">
              This reset link is invalid or has expired. Go back to the login page and request a new one. Open the
              link in the same browser you requested it from.
            </p>
          )}
          {!ready && !checked && <p className="rp__note">Checking your reset link…</p>}
          {ready && !done && (
            <form onSubmit={handleSubmit}>
              <label>
                <span>New password</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
              </label>
              <label>
                <span>Confirm new password</span>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={8} required />
              </label>
              <button type="submit" disabled={status === "saving"}>{status === "saving" ? "Saving…" : "Update password"}</button>
            </form>
          )}
          {message && <p className={`rp__msg rp__msg--${message.type}`}>{message.text}</p>}
          <Link href="/launchpad/apply-investor" className="rp__back">Go to investor login →</Link>
        </div>
      </main>
      <SiteFooter />
      <style jsx>{`
        .rp { max-width: 440px; margin: 3rem auto; padding: 0 1.25rem; font-family: var(--lp-font-body); }
        .rp__card { background: var(--lp-panel); border: 1px solid var(--lp-line); border-radius: 12px; padding: 1.75rem; display: flex; flex-direction: column; gap: 1rem; }
        h1 { margin: 0; font-size: 1.4rem; }
        form { display: flex; flex-direction: column; gap: 1rem; }
        label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.74rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--lp-mute); }
        input { background: var(--lp-panel-raised); border: 1px solid var(--lp-line); border-radius: 4px; color: var(--lp-ink); font-size: 0.95rem; padding: 0.65rem 0.8rem; }
        button { background: var(--lp-brass); color: var(--lp-on-accent); font-weight: 600; border: 0; border-radius: 4px; padding: 0.7rem 1rem; cursor: pointer; }
        button:disabled { background: var(--lp-panel-raised); color: var(--lp-mute); cursor: not-allowed; }
        .rp__note { color: var(--lp-mute); margin: 0; }
        .rp__msg { margin: 0; font-size: 0.86rem; line-height: 1.5; }
        .rp__msg--ok { color: var(--lp-signal-green); }
        .rp__msg--error { color: var(--lp-signal-red); }
        .rp__back { color: var(--lp-brass-bright); font-size: 0.84rem; text-decoration: none; }
      `}</style>
    </>
  );
}
