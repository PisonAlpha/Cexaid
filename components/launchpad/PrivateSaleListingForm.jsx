"use client";

import { useState } from "react";
import { useLaunchpad } from "@/lib/launchpad/LaunchpadContext";
import { WalletConnectButton } from "./WalletConnectButton";
import { LogoPicker } from "./LogoPicker";

export function PrivateSaleListingForm({ onCreated }) {
  const { wallet, createPrivateSaleListing, myProject } = useLaunchpad();
  const [form, setForm] = useState({
    name: myProject?.name ?? "",
    tagline: myProject?.tagline ?? "",
    description: myProject?.description ?? "",
    website: myProject?.website ?? "",
    logoUrl: myProject?.logoUrl ?? "",
    twitter: myProject?.twitter ?? "",
    telegram: myProject?.telegram ?? "",
    roundTagline: "",
    tokenSymbol: "",
    tokenContract: "",
    tokenPriceUSD: "",
    totalAllocationUSD: "",
    minTicketUSD: "",
    maxTicketUSD: "",
    startsAt: "",
    endsAt: "",
    tgeAt: "",
    tgePercent: "",
    cliffMonths: "0",
    linearMonths: "",
  });
  const [error, setError] = useState(null);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.tagline || !form.description) {
      setError("Project name, tagline, and description are required.");
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(form.tokenContract.trim())) {
      setError("Create your token first, then paste its contract address here (0x…, 42 characters).");
      return;
    }
    if (!form.tokenSymbol || !form.tokenPriceUSD || !form.totalAllocationUSD || !form.minTicketUSD || !form.maxTicketUSD || !form.startsAt || !form.endsAt) {
      setError("Fill in all the sale terms.");
      return;
    }
    if (!form.tgeAt || form.tgePercent === "" || form.linearMonths === "" && Number(form.tgePercent) < 100) {
      setError("Set the token claim (TGE) date and the vesting terms.");
      return;
    }
    // Dates are typed in the founder's local time. Convert them to exact UTC moments here in the
    // browser, so the server (which may run in another time zone) stores what the founder meant.
    const startMs = new Date(form.startsAt).getTime();
    const endMs = new Date(form.endsAt).getTime();
    const tgeMs = new Date(form.tgeAt).getTime();
    if (!startMs || !endMs || !tgeMs) {
      setError("One of the dates is not valid. Re-enter the start, end and claim (TGE) dates.");
      return;
    }
    if (endMs <= startMs) {
      setError("The sale end must be after the sale start.");
      return;
    }
    if (endMs <= Date.now()) {
      setError("The sale end date is already in the past.");
      return;
    }
    if (tgeMs < endMs) {
      setError("The token claim (TGE) date must be on or after the sale end date.");
      return;
    }
    const result = await createPrivateSaleListing({
      ...form,
      tokenContract: form.tokenContract.trim(),
      startsAt: new Date(startMs).toISOString(),
      endsAt: new Date(endMs).toISOString(),
      tgeAt: new Date(tgeMs).toISOString(),
    });
    if (result.ok) {
      onCreated?.(result);
    } else {
      setError(result.error);
    }
  }

  return (
    <form className="create" onSubmit={handleSubmit}>
      <div className="create__head">
        <h3>Apply for Private Sale</h3>
        <WalletConnectButton />
      </div>
      <p className="create__note">
        Reviewed by CEXAID before it goes public — approval typically takes
        1–2 business days. After approval you deploy the sale contract from your
        own wallet and pay a 20 USDT listing fee to the CEXAID treasury.
      </p>

      <section className="create__section">
        <h4>Project details</h4>
        <LogoPicker value={form.logoUrl} name={form.name} disabled={!!myProject} onChange={(v) => setForm((prev) => ({ ...prev, logoUrl: v }))} />
        <label className="create__field">
          <span>Project name</span>
          <input type="text" value={form.name} onChange={update("name")} disabled={!!myProject} />
        </label>
        <label className="create__field">
          <span>Tagline</span>
          <input type="text" value={form.tagline} onChange={update("tagline")} disabled={!!myProject} />
        </label>
        <label className="create__field">
          <span>Description</span>
          <textarea rows={3} value={form.description} onChange={update("description")} disabled={!!myProject} />
        </label>
        <label className="create__field">
          <span>Website</span>
          <input type="url" value={form.website} onChange={update("website")} disabled={!!myProject} />
        </label>
        <div className="create__row">
          <label className="create__field">
            <span>Twitter (optional)</span>
            <input type="url" value={form.twitter} onChange={update("twitter")} disabled={!!myProject} />
          </label>
          <label className="create__field">
            <span>Telegram (optional)</span>
            <input type="url" value={form.telegram} onChange={update("telegram")} disabled={!!myProject} />
          </label>
        </div>
        {myProject && (
          <p className="create__reuse">
            Using your existing project "{myProject.name}" — details locked. Contact
            CEXAID if you need to change them.
          </p>
        )}
      </section>

      <section className="create__section">
        <h4>Private Sale terms</h4>
        <label className="create__field">
          <span>Round tagline (optional)</span>
          <input type="text" value={form.roundTagline} onChange={update("roundTagline")} />
        </label>
        <label className="create__field">
          <span>Token contract address on BNB Chain (required)</span>
          <input type="text" placeholder="0x… (your token must already be created)" value={form.tokenContract} onChange={update("tokenContract")} />
        </label>
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
            <span>Total allocation (USD)</span>
            <input type="number" value={form.totalAllocationUSD} onChange={update("totalAllocationUSD")} />
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
            <span>Token delivery (enforced on-chain)</span>
          </div>
          <p className="create__note">
            Investors claim their tokens from the sale contract on this schedule. It cannot be changed once the
            contract is deployed. You must deposit enough tokens into the contract before the sale can open.
          </p>
          <div className="create__row">
            <label className="create__field">
              <span>Claim opens (TGE date)</span>
              <input type="datetime-local" value={form.tgeAt} onChange={update("tgeAt")} />
            </label>
            <label className="create__field">
              <span>Unlocked at TGE (%)</span>
              <input type="number" min="0" max="100" value={form.tgePercent} onChange={update("tgePercent")} />
            </label>
          </div>
          <div className="create__row">
            <label className="create__field">
              <span>Cliff after TGE (months)</span>
              <input type="number" min="0" max="48" value={form.cliffMonths} onChange={update("cliffMonths")} />
            </label>
            <label className="create__field">
              <span>Linear vesting after cliff (months)</span>
              <input type="number" min="0" max="60" value={form.linearMonths} onChange={update("linearMonths")} />
            </label>
          </div>
          <p className="create__note">
            Example: 20% at TGE, 1-month cliff, 6 months linear means 20% on the TGE date, nothing for a month, then
            the remaining 80% unlocks evenly over 6 months. The TGE date must be on or after the sale end date, and
            within 180 days of it.
          </p>
        </div>
      </section>

      <button type="submit" className="create__submit" disabled={!wallet.address}>
        {wallet.address ? "Submit for CEXAID review" : "Connect a wallet to continue"}
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
        .create__head {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .create__head h3 {
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
          line-height: 1.5;
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
        .create__field input:focus,
        .create__field textarea:focus {
          outline: 2px solid var(--lp-brass);
          outline-offset: 1px;
        }
        .create__field input:disabled,
        .create__field textarea:disabled {
          opacity: 0.6;
        }
        .create__reuse {
          font-family: var(--lp-font-body);
          font-size: 0.78rem;
          color: var(--lp-brass);
          margin: 0;
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
          color: var(--lp-on-accent);
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
