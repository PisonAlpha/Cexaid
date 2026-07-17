"use client";

import { useState } from "react";
import { useLaunchpad } from "@/lib/launchpad/LaunchpadContext";
import { WalletConnectButton } from "./WalletConnectButton";

export function KycForm({ onSubmitted }) {
  const { wallet, submitKyc } = useLaunchpad();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    country: "",
    phone: "",
    businessName: "",
    registrationNumber: "",
    businessCountry: "",
  });
  const [status, setStatus] = useState("idle"); // idle | submitting
  const [error, setError] = useState(null);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.fullName || !form.email || !form.country) {
      setError("Full name, email, and country are required.");
      return;
    }
    if (!form.businessName || !form.registrationNumber || !form.businessCountry) {
      setError("Business name, registration number, and business country are required.");
      return;
    }

    setStatus("submitting");
    const result = await submitKyc(form);
    setStatus("idle");

    if (result.ok) {
      onSubmitted?.();
    } else {
      setError(result.error);
    }
  }

  return (
    <form className="kyc-form" onSubmit={handleSubmit}>
      <div className="kyc-form__head">
        <h3>Submit founder &amp; business details</h3>
        <WalletConnectButton />
      </div>

      <p className="kyc-form__note">No documents needed - just accurate details.</p>

      <section className="kyc-form__section">
        <h4>Founder</h4>
        <label className="kyc-form__field">
          <span>Full legal name</span>
          <input type="text" value={form.fullName} onChange={update("fullName")} disabled={!wallet.address} />
        </label>
        <div className="kyc-form__row">
          <label className="kyc-form__field">
            <span>Email</span>
            <input type="email" value={form.email} onChange={update("email")} disabled={!wallet.address} />
          </label>
          <label className="kyc-form__field">
            <span>Country</span>
            <input type="text" value={form.country} onChange={update("country")} disabled={!wallet.address} />
          </label>
        </div>
        <label className="kyc-form__field">
          <span>Phone (optional)</span>
          <input type="text" value={form.phone} onChange={update("phone")} disabled={!wallet.address} />
        </label>
      </section>

      <section className="kyc-form__section">
        <h4>Business</h4>
        <label className="kyc-form__field">
          <span>Business name</span>
          <input
            type="text"
            value={form.businessName}
            onChange={update("businessName")}
            disabled={!wallet.address}
          />
        </label>
        <div className="kyc-form__row">
          <label className="kyc-form__field">
            <span>Registration number</span>
            <input
              type="text"
              value={form.registrationNumber}
              onChange={update("registrationNumber")}
              disabled={!wallet.address}
            />
          </label>
          <label className="kyc-form__field">
            <span>Country of registration</span>
            <input
              type="text"
              value={form.businessCountry}
              onChange={update("businessCountry")}
              disabled={!wallet.address}
            />
          </label>
        </div>
      </section>

      <button type="submit" className="kyc-form__submit" disabled={!wallet.address || status === "submitting"}>
        {!wallet.address ? "Connect a wallet to continue" : status === "submitting" ? "Submitting…" : "Submit for review"}
      </button>

      {error && <p className="kyc-form__error">{error}</p>}

      <style jsx>{`
        .kyc-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          background: var(--lp-panel);
          border: 1px solid var(--lp-line);
          padding: 1.5rem;
        }
        .kyc-form__head {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .kyc-form__head h3 {
          font-family: var(--lp-font-display);
          font-size: 1.2rem;
          margin: 0;
          color: var(--lp-ink);
        }
        .kyc-form__note {
          font-family: var(--lp-font-body);
          font-size: 0.8rem;
          color: var(--lp-mute);
          margin: 0;
        }
        .kyc-form__section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid var(--lp-line);
        }
        .kyc-form__section h4 {
          font-family: var(--lp-font-display);
          font-size: 0.95rem;
          margin: 0;
          color: var(--lp-brass);
        }
        .kyc-form__row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 0.75rem;
        }
        .kyc-form__field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-family: var(--lp-font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--lp-mute);
        }
        .kyc-form__field input {
          background: var(--lp-panel-raised);
          border: 1px solid var(--lp-line);
          border-radius: 2px;
          color: var(--lp-ink);
          font-family: var(--lp-font-body);
          font-size: 0.9rem;
          padding: 0.55rem 0.7rem;
        }
        .kyc-form__submit {
          background: var(--lp-brass);
          color: var(--lp-void);
          font-weight: 600;
          font-size: 0.9rem;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 2px;
          cursor: pointer;
        }
        .kyc-form__submit:disabled {
          background: var(--lp-panel-raised);
          color: var(--lp-mute);
          cursor: not-allowed;
        }
        .kyc-form__error {
          font-family: var(--lp-font-body);
          font-size: 0.82rem;
          color: var(--lp-signal-red);
          margin: 0;
        }
      `}</style>
    </form>
  );
}
