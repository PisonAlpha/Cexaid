"use client";

import { useState } from "react";
import { useLaunchpad } from "@/lib/launchpad/LaunchpadContext";

export function InvestorAuthForm() {
  const { investorSignUp, investorSignIn } = useLaunchpad();
  const [mode, setMode] = useState("signup"); // signup | login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setStatus("submitting");

    const result =
      mode === "signup" ? await investorSignUp(email, password) : await investorSignIn(email, password);

    setStatus("idle");

    if (!result.ok) {
      setMessage({ type: "error", text: result.error });
      return;
    }
    if (mode === "signup" && result.needsConfirmation) {
      setMessage({
        type: "ok",
        text: "Account created. Check your email to confirm it, then log in below.",
      });
      setMode("login");
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form__toggle">
        <button
          type="button"
          className={mode === "signup" ? "auth-form__tab auth-form__tab--active" : "auth-form__tab"}
          onClick={() => setMode("signup")}
        >
          Sign up
        </button>
        <button
          type="button"
          className={mode === "login" ? "auth-form__tab auth-form__tab--active" : "auth-form__tab"}
          onClick={() => setMode("login")}
        >
          Log in
        </button>
      </div>

      <p className="auth-form__note">
        {mode === "signup"
          ? "Create your investor account with email and password. You'll apply for approval next, then connect a wallet once approved."
          : "Log in to check your status or contribute to an approved round."}
      </p>

      <label className="auth-form__field">
        <span>Email</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label className="auth-form__field">
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
      </label>

      <button type="submit" className="auth-form__submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
      </button>

      {message && (
        <p className={`auth-form__message auth-form__message--${message.type}`}>{message.text}</p>
      )}

      <style jsx>{`
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: var(--lp-panel);
          border: 1px solid var(--lp-line);
          padding: 1.5rem;
        }
        .auth-form__toggle {
          display: flex;
          gap: 0.5rem;
        }
        .auth-form__tab {
          flex: 1;
          background: var(--lp-panel-raised);
          border: 1px solid var(--lp-line);
          color: var(--lp-mute);
          font-family: var(--lp-font-mono);
          font-size: 0.78rem;
          padding: 0.5rem;
          border-radius: 2px;
          cursor: pointer;
        }
        .auth-form__tab--active {
          border-color: var(--lp-brass);
          color: var(--lp-brass);
        }
        .auth-form__note {
          font-family: var(--lp-font-body);
          font-size: 0.82rem;
          color: var(--lp-mute);
          margin: 0;
          line-height: 1.5;
        }
        .auth-form__field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-family: var(--lp-font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--lp-mute);
        }
        .auth-form__field input {
          background: var(--lp-panel-raised);
          border: 1px solid var(--lp-line);
          border-radius: 2px;
          color: var(--lp-ink);
          font-family: var(--lp-font-body);
          font-size: 0.9rem;
          padding: 0.6rem 0.75rem;
        }
        .auth-form__submit {
          background: var(--lp-brass);
          color: var(--lp-void);
          font-weight: 600;
          font-size: 0.9rem;
          padding: 0.7rem 1rem;
          border: none;
          border-radius: 2px;
          cursor: pointer;
        }
        .auth-form__submit:disabled {
          background: var(--lp-panel-raised);
          color: var(--lp-mute);
          cursor: not-allowed;
        }
        .auth-form__message {
          font-family: var(--lp-font-body);
          font-size: 0.82rem;
          margin: 0;
        }
        .auth-form__message--ok {
          color: var(--lp-signal-green);
        }
        .auth-form__message--error {
          color: var(--lp-signal-red);
        }
      `}</style>
    </form>
  );
}
