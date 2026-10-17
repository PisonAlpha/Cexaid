"use client";

import { useState } from "react";
import { useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/lib/launchpad/wagmiConfig";
import { SALE_ROUND_ABI, ERC20_ABI } from "@/lib/launchpad/saleAbi";
import { ACTIVE_CHAIN } from "@/lib/launchpad/chain";
import { fmtUnits } from "@/lib/launchpad/units";

// Only shown to the project's founder wallet. The sale cannot open until the
// founder deposits the tokens; surplus can be taken back after the sale.
export function FounderTokenPanel({ roundAddress, chain }) {
  const { writeContractAsync } = useWriteContract();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const c = chain;
  if (!c.loaded || !c.wallet || !c.founder || c.wallet.toLowerCase() !== c.founder.toLowerCase()) return null;

  const dec = Number(c.tokenDecimals ?? 18);
  const sym = c.symbol || "tokens";
  const f = (v) => fmtUnits(v, dec, 4);
  const required = c.tokensForHardCap ?? 0n;
  const deposited = c.tokensDeposited ?? 0n;
  const shortfall = required > deposited ? required - deposited : 0n;
  const owed = c.tokensOwed ?? 0n;
  const held = c.contractTokenBalance ?? 0n;
  const surplus = held > owed ? held - owed : 0n;
  const ended = Date.now() / 1000 > Number(c.endTime);
  const canWithdraw = (ended || c.refundsOpen) && surplus > 0n;

  async function run(label, req) {
    setBusy(true);
    setMsg(`${label}: confirm in your wallet…`);
    try {
      const hash = await writeContractAsync({ ...req, chainId: ACTIVE_CHAIN.id });
      setMsg(`${label}: waiting for confirmation…`);
      await waitForTransactionReceipt(wagmiConfig, { hash, chainId: ACTIVE_CHAIN.id });
      setMsg(`${label}: done ✓`);
      c.refetch();
    } catch (e) {
      setMsg(`${label}: ${e?.shortMessage || "failed or rejected."}`);
    }
    setBusy(false);
  }

  const deposit = () => {
    if ((c.myTokenBalance ?? 0n) < shortfall) return setMsg(`Your wallet holds ${f(c.myTokenBalance ?? 0n)} ${sym}, but ${f(shortfall)} is needed.`);
    run("Deposit tokens", { address: c.token, abi: ERC20_ABI, functionName: "transfer", args: [roundAddress, shortfall] });
  };

  return (
    <div className="fp">
      <h4>Founder: token deposit</h4>
      <p className="fp__note">
        The sale opens only after the contract holds enough {sym} to cover the full hard cap. Investors then claim from
        this contract on the vesting schedule. You cannot change or withdraw the tokens investors are owed.
      </p>
      <div className="fp__grid">
        <div><span>Required for hard cap</span><b>{f(required)} {sym}</b></div>
        <div><span>Deposited</span><b>{f(deposited)} {sym}</b></div>
        <div><span>Your wallet balance</span><b>{f(c.myTokenBalance ?? 0n)} {sym}</b></div>
      </div>
      {shortfall > 0n ? (
        <button className="fp__btn" onClick={deposit} disabled={busy}>
          {busy ? "Working…" : `Deposit ${f(shortfall)} ${sym}`}
        </button>
      ) : (
        <p className="fp__ok">✓ Fully funded. Investors can contribute.</p>
      )}
      {canWithdraw && (
        <button className="fp__btn fp__btn--ghost" onClick={() => run("Withdraw", { address: roundAddress, abi: SALE_ROUND_ABI, functionName: "withdrawUnsold" })} disabled={busy}>
          {c.refundsOpen ? `Take back all ${f(surplus)} ${sym}` : `Withdraw unsold ${f(surplus)} ${sym}`}
        </button>
      )}
      {msg && <p className="fp__note">{msg}</p>}
      <style jsx>{`
        .fp { font-family: var(--lp-font-body); background: var(--lp-panel-raised); border: 1px solid var(--lp-brass); border-radius: 10px; padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: 0.7rem; }
        h4 { margin: 0; font-size: 1rem; color: var(--lp-ink); }
        .fp__note { margin: 0; color: var(--lp-mute); font-size: 0.82rem; line-height: 1.55; }
        .fp__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 0.6rem; }
        .fp__grid div { background: var(--lp-panel); border: 1px solid var(--lp-line); border-radius: 8px; padding: 0.6rem 0.75rem; display: flex; flex-direction: column; gap: 0.2rem; }
        .fp__grid span { color: var(--lp-mute); font-size: 0.72rem; }
        .fp__grid b { color: var(--lp-ink); font-size: 0.92rem; }
        .fp__btn { background: var(--lp-brass); color: var(--lp-on-accent); font-weight: 600; border: 0; border-radius: 8px; padding: 0.7rem 1.1rem; cursor: pointer; align-self: flex-start; }
        .fp__btn--ghost { background: var(--lp-panel); color: var(--lp-ink); border: 1px solid var(--lp-line); }
        .fp__btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .fp__ok { margin: 0; color: var(--lp-signal-green); font-size: 0.86rem; font-weight: 600; }
      `}</style>
    </div>
  );
}
