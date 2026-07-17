"use client";

import { useState } from "react";
import { useLaunchpad } from "@/lib/launchpad/LaunchpadContext";
import { WalletConnectButton } from "./WalletConnectButton";

export function ContributionForm({ round }) {
  const { wallet, contribute } = useLaunchpad();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | signing

  const disabled = round.status !== "live" || status === "signing";

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    const amountUSD = Number(amount);

    setStatus("signing");
    const result = await contribute(round.id, amountUSD);
    setStatus("idle");

    if (result.ok) {
      const tokens = Math.round(amountUSD / round.tokenPriceUSD);
      setMessage({
        type: "ok",
        text: `Contribution confirmed on-chain. You're entitled to ${tokens.toLocaleString()} ${round.tokenSymbol}, claimable per the vesting schedule once TGE is announced. Tx: ${result.txHash?.slice(0, 10)}…`,
      });
      setAmount("");
    } else {
      setMessage({ type: "error", text: result.error });
    }
  }

  return (
    <form className="contrib" onSubmit={handleSubmit}>
      <div className="contrib__head">
        <h4>Contribute</h4>
        <WalletConnectButton />
      </div>

      <p className="contrib__note">
        Paid in USDT (BEP20) at ${round.tokenPriceUSD} per {round.tokenSymbol}.
        You're entitled to your tokens now, claimable once the project's TGE
        is announced, on the vesting schedule below.
      </p>

      <label className="contrib__field">
        <span>Amount (USDT)</span>
        <input
          type="number"
          inputMode="decimal"
          placeholder={`${round.minTicketUSD} – ${round.maxTicketUSD}`}
          value={amount}
          disabled={disabled}
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>

      <div className="contrib__estimate">
        You'll be entitled to:{" "}
        <strong>
          {amount ? Math.round(Number(amount) / round.tokenPriceUSD).toLocaleString() : "—"}{" "}
          {round.tokenSymbol}
        </strong>
      </div>

      <button type="submit" disabled={disabled} className="contrib__submit">
        {status === "signing" ? "Confirm in wallet…" : disabled ? "Round not open" : "Contribute (sends USDT)"}
      </button>

      {message && (
        <p className={`contrib__message contrib__message--${message.type}`}>{message.text}</p>
      )}

      <style jsx>{`
        .contrib {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          background: var(--lp-panel);
          border: 1px solid var(--lp-line);
          padding: 1.5rem;
        }
        .contrib__head {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .contrib__head h4 {
          font-family: var(--lp-font-display);
          font-size: 1.15rem;
          margin: 0;
          color: var(--lp-ink);
        }
        .contrib__note {
          font-family: var(--lp-font-body);
          font-size: 0.8rem;
          color: var(--lp-mute);
          margin: 0;
          line-height: 1.5;
        }
        .contrib__field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-family: var(--lp-font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--lp-mute);
        }
        .contrib__field input {
          background: var(--lp-panel-raised);
          border: 1px solid var(--lp-line);
          border-radius: 2px;
          color: var(--lp-ink);
          font-family: var(--lp-font-mono);
          font-size: 1rem;
          padding: 0.6rem 0.75rem;
        }
        .contrib__field input:focus {
          outline: 2px solid var(--lp-brass);
          outline-offset: 1px;
        }
        .contrib__estimate {
          font-family: var(--lp-font-mono);
          font-size: 0.78rem;
          color: var(--lp-mute);
        }
        .contrib__estimate strong {
          color: var(--lp-brass);
        }
        .contrib__submit {
          background: var(--lp-brass);
          color: var(--lp-void);
          font-weight: 600;
          font-size: 0.9rem;
          padding: 0.7rem 1rem;
          border: none;
          border-radius: 2px;
          cursor: pointer;
        }
        .contrib__submit:disabled {
          background: var(--lp-panel-raised);
          color: var(--lp-mute);
          cursor: not-allowed;
        }
        .contrib__message {
          font-family: var(--lp-font-body);
          font-size: 0.82rem;
          margin: 0;
        }
        .contrib__message--ok {
          color: var(--lp-signal-green);
        }
        .contrib__message--error {
          color: var(--lp-signal-red);
        }
      `}</style>
    </form>
  );
}
