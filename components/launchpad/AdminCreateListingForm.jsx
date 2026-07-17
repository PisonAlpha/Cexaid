"use client";

import { useState } from "react";

const EMPTY_VESTING = [{ label: "At TGE (claim opens)", percent: "" }];

export function AdminCreateListingForm({ onCreated }) {
  const [form, setForm] = useState({
    name: "",
    tagline: "",
    description: "",
    website: "",
    logoUrl: "",
    twitter: "",
    telegram: "",
    founderWallet: "",
    tokenSymbol: "",
    tokenPriceUSD: "",
    totalAllocationUSD: "",
    raisedUSD: "",
    minTicketUSD: "",
    maxTicketUSD: "",
    startsAt: "",
    endsAt: "",
    chain: "BNB Chain",
    vestingSchedule: EMPTY_VESTING,
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function updateVestingStep(index, field) {
    return (e) =>
      setForm((prev) => {
        const steps = [...prev.vestingSchedule];
        steps[index] = { ...steps[index], [field]: e.target.value };
        return { ...prev, vestingSchedule: steps };
      });
  }

  function addVestingStep() {
    setForm((prev) => ({
      ...prev,
      vestingSchedule: [...prev.vestingSchedule, { label: "", percent: "" }],
    }));
  }

  function removeVestingStep(index) {
    setForm((prev) => ({
      ...prev,
      vestingSchedule: prev.vestingSchedule.filter((_, i) => i !== index),
    }));
  }

  const vestingTotal = form.vestingSchedule.reduce((sum, s) => sum + (Number(s.percent) || 0), 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.tagline || !form.description || !form.founderWallet) {
      setError("Project name, tagline, description, and founder wallet are required.");
      return;
    }

    setStatus("submitting");
    const res = await fetch("/api/admin/create-listing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        vestingSchedule: form.vestingSchedule.map((s) => ({
          label: s.label,
          percent: Number(s.percent) || 0,
        })),
      }),
    }).then((r) => r.json());
    setStatus("idle");

    if (res.ok) {
      onCreated?.(res);
    } else {
      setError(res.error);
    }
  }

  return (
    <form className="create" onSubmit={handleSubmit}>
      <h3>Create Private Sale listing directly</h3>
      <p className="create__note">
        Goes live immediately, fully approved - no founder review queue, no
        KYC gate. Use for projects CEXAID sources and onboards itself.
      </p>

      <section className="create__section">
        <h4>Project details</h4>
        <label className="create__field">
          <span>Project name</span>
          <input type="text" value={form.name} onChange={update("name")} />
        </label>
        <label className="create__field">
          <span>Tagline</span>
          <input type="text" value={form.tagline} onChange={update("tagline")} />
        </label>
        <label className="create__field">
          <span>Description</span>
          <textarea rows={3} value={form.description} onChange={update("description")} />
        </label>
        <div className="create__row">
          <label className="create__field">
            <span>Website</span>
            <input type="url" value={form.website} onChange={update("website")} />
          </label>
          <label className="create__field">
            <span>Logo URL</span>
            <input type="url" value={form.logoUrl} onChange={update("logoUrl")} />
          </label>
        </div>
        <div className="create__row">
          <label className="create__field">
            <span>Twitter</span>
            <input type="url" value={form.twitter} onChange={update("twitter")} />
          </label>
          <label className="create__field">
            <span>Telegram</span>
            <input type="url" value={form.telegram} onChange={update("telegram")} />
          </label>
        </div>
        <label className="create__field">
          <span>Founder wallet address</span>
          <input type="text" value={form.founderWallet} onChange={update("founderWallet")} />
        </label>
      </section>

      <section className="create__section">
        <h4>Round terms</h4>
        <div className="create__row">
          <label className="create__field">
            <span>Token symbol</span>
            <input type="text" value={form.tokenSymbol} onChange={update("tokenSymbol")} />
          </label>
          <label className="create__field">
            <span>Price per token (USD)</span>
            <input type="number" step="0.0001" value={form.tokenPriceUSD} onChange={update("tokenPriceUSD")} />
          </label>
          <label className="create__field">
            <span>Chain</span>
            <input type="text" value={form.chain} onChange={update("chain")} />
          </label>
        </div>
        <div className="create__row">
          <label className="create__field">
            <span>Total allocation (USD)</span>
            <input type="number" value={form.totalAllocationUSD} onChange={update("totalAllocationUSD")} />
          </label>
          <label className="create__field">
            <span>Already raised (USD, optional)</span>
            <input type="number" value={form.raisedUSD} onChange={update("raisedUSD")} />
          </label>
        </div>
        <div className="create__row">
          <label className="create__field">
            <span>Min ticket (USD)</span>
            <input type="number" value={form.minTicketUSD} onChange={update("minTicketUSD")} />
          </label>
          <label className="create__field">
            <span>Max ticket (USD)</span>
            <input type="number" value={form.maxTicketUSD} onChange={update("maxTicketUSD")} />
          </label>
        </div>
        <div className="create__row">
          <label className="create__field">
            <span>Starts</span>
            <input type="datetime-local" value={form.startsAt} onChange={update("startsAt")} />
          </label>
          <label className="create__field">
            <span>Ends</span>
            <input type="datetime-local" value={form.endsAt} onChange={update("endsAt")} />
          </label>
        </div>

        <div className="create__vesting">
          <div className="create__vesting-head">
            <span>Vesting schedule</span>
            <span className={vestingTotal !== 100 ? "create__vesting-warn" : ""}>
              {vestingTotal}% allocated
            </span>
          </div>
          {form.vestingSchedule.map((step, i) => (
            <div className="create__vesting-row" key={i}>
              <input
                type="text"
                placeholder="Label (e.g. At TGE, Month 1)"
                value={step.label}
                onChange={updateVestingStep(i, "label")}
              />
              <input
                type="number"
                placeholder="%"
                value={step.percent}
                onChange={updateVestingStep(i, "percent")}
              />
              <button type="button" onClick={() => removeVestingStep(i)}>
                ×
              </button>
            </div>
          ))}
          <button type="button" className="create__vesting-add" onClick={addVestingStep}>
            + Add vesting step
          </button>
        </div>
      </section>

      <button type="submit" className="create__submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Creating…" : "Create & publish listing"}
      </button>
      {error && <p className="create__error">{error}</p>}

      <style jsx>{`
        .create {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          background: var(--lp-panel);
          border: 1px solid var(--lp-line);
          padding: 1.5rem;
        }
        .create h3 {
          font-family: var(--lp-font-display);
          font-size: 1.3rem;
          margin: 0;
          color: var(--lp-ink);
        }
        .create__note {
          font-family: var(--lp-font-body);
          font-size: 0.82rem;
          color: var(--lp-mute);
          margin: 0;
        }
        .create__section {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          padding-top: 1rem;
          border-top: 1px solid var(--lp-line);
        }
        .create__section h4 {
          font-family: var(--lp-font-display);
          font-size: 1.05rem;
          margin: 0;
          color: var(--lp-brass);
        }
        .create__row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 0.9rem;
        }
        .create__field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-family: var(--lp-font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--lp-mute);
        }
        .create__field input,
        .create__field textarea {
          background: var(--lp-panel-raised);
          border: 1px solid var(--lp-line);
          border-radius: 2px;
          color: var(--lp-ink);
          font-family: var(--lp-font-body);
          font-size: 0.9rem;
          padding: 0.55rem 0.7rem;
          resize: vertical;
        }
        .create__vesting {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          background: var(--lp-panel-raised);
          border: 1px solid var(--lp-line);
          padding: 0.9rem;
        }
        .create__vesting-head {
          display: flex;
          justify-content: space-between;
          font-family: var(--lp-font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--lp-mute);
        }
        .create__vesting-warn {
          color: var(--lp-signal-red);
        }
        .create__vesting-row {
          display: grid;
          grid-template-columns: 1fr 5rem 2rem;
          gap: 0.5rem;
        }
        .create__vesting-row input {
          background: var(--lp-panel);
          border: 1px solid var(--lp-line);
          border-radius: 2px;
          color: var(--lp-ink);
          font-family: var(--lp-font-body);
          font-size: 0.82rem;
          padding: 0.4rem 0.55rem;
        }
        .create__vesting-row button {
          background: transparent;
          border: 1px solid var(--lp-line);
          border-radius: 2px;
          color: var(--lp-signal-red);
          cursor: pointer;
        }
        .create__vesting-add {
          align-self: flex-start;
          background: transparent;
          border: none;
          color: var(--lp-brass);
          font-family: var(--lp-font-mono);
          font-size: 0.75rem;
          cursor: pointer;
          padding: 0.2rem 0;
        }
        .create__submit {
          background: var(--lp-brass);
          color: var(--lp-void);
          font-weight: 600;
          font-size: 0.9rem;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 2px;
          cursor: pointer;
        }
        .create__submit:disabled {
          background: var(--lp-panel-raised);
          color: var(--lp-mute);
          cursor: not-allowed;
        }
        .create__error {
          font-family: var(--lp-font-body);
          font-size: 0.82rem;
          color: var(--lp-signal-red);
          margin: 0;
        }
      `}</style>
    </form>
  );
}
