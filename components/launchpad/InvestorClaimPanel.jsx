"use client";

import { useState } from "react";
import { useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/lib/launchpad/wagmiConfig";
import { SALE_ROUND_ABI } from "@/lib/launchpad/saleAbi";
import { ACTIVE_CHAIN, explorerTxUrl } from "@/lib/launchpad/chain";
import { fmtUnits } from "@/lib/launchpad/units";

// The connected investor's own position: what they bought, what has unlocked,
// what they have claimed, and a button to claim the rest.
export function InvestorClaimPanel({ roundAddress, chain }) {
  const { writeContractAsync } = useWriteContract();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [tx, setTx] = useState("");
  const c = chain;
  if (!c.loaded) return null;
  const dec = Number(c.tokenDecimals ?? 18);
  const sym = c.symbol || "tokens";
  const tgeMs = Number(c.tgeTime) * 1000;
  const started = Date.now() >= tgeMs;
  const mine = c.mine;
  const f = (v) => fmtUnits(v, dec, 4);

  async function claim() {
    setBusy(true);
    setMsg("Confirm in your wallet…");
    try {
      const hash = await writeContractAsync({ address: roundAddress, abi: SALE_ROUND_ABI, functionName: "claim", chainId: ACTIVE_CHAIN.id });
      setMsg("Waiting for confirmation…");
      await waitForTransactionReceipt(wagmiConfig, { hash, chainId: ACTIVE_CHAIN.id });
      setTx(hash);
      setMsg("Tokens sent to your wallet ✓");
      c.refetch();
    } catch (e) {
      setMsg(e?.shortMessage || "Claim failed or was rejected.");
    }
    setBusy(false);
  }

  return (
    <div className="ic">
      <h4>Your position</h4>
      {!mine && <p className="ic__note">Connect the wallet you contributed from to see and claim your tokens.</p>}
      {mine && mine.tokensOf === 0n && <p className="ic__note">This wallet has no allocation in this round.</p>}
      {mine && mine.tokensOf > 0n && (
        <>
          <div className="ic__grid">
            <div><span>Contributed</span><b>{fmtUnits(mine.contributed, 18, 2)} USDT</b></div>
            <div><span>Tokens purchased</span><b>{f(mine.tokensOf)} {sym}</b></div>
            <div><span>Unlocked so far</span><b>{f(mine.vested)} {sym}</b></div>
            <div><span>Already claimed</span><b>{f(mine.claimed)} {sym}</b></div>
          </div>
          {c.refundsOpen ? (
            <p className="ic__note">Refunds are open for this round, so token claims are closed. Claim your USDT refund above.</p>
          ) : !started ? (
            <p className="ic__note">Claiming opens on {new Date(tgeMs).toLocaleString()}.</p>
          ) : (
            <button className="ic__btn" onClick={claim} disabled={busy || mine.claimable === 0n}>
              {busy ? "Working…" : mine.claimable === 0n ? "Nothing to claim right now" : `Claim ${f(mine.claimable)} ${sym}`}
            </button>
          )}
          {msg && <p className="ic__note">{msg}</p>}
          {tx && <a href={explorerTxUrl(tx)} target="_blank" rel="noopener noreferrer" className="ic__link">View transaction ↗</a>}
        </>
      )}
      <style jsx>{`
        .ic { font-family: var(--lp-font-body); background: var(--lp-panel-raised); border: 1px solid var(--lp-line); border-radius: 10px; padding: 1rem 1.1rem; display: flex; flex-direction: column; gap: 0.75rem; }
        h4 { margin: 0; font-size: 1rem; color: var(--lp-ink); }
        .ic__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.6rem; }
        .ic__grid div { background: var(--lp-panel); border: 1px solid var(--lp-line); border-radius: 8px; padding: 0.6rem 0.75rem; display: flex; flex-direction: column; gap: 0.2rem; }
        .ic__grid span { color: var(--lp-mute); font-size: 0.72rem; }
        .ic__grid b { color: var(--lp-ink); font-size: 0.92rem; }
        .ic__btn { background: var(--lp-brass); color: var(--lp-on-accent); font-weight: 600; border: 0; border-radius: 8px; padding: 0.7rem 1.1rem; cursor: pointer; align-self: flex-start; }
        .ic__btn:disabled { background: var(--lp-panel); color: var(--lp-mute); cursor: not-allowed; }
        .ic__note { margin: 0; color: var(--lp-mute); font-size: 0.82rem; line-height: 1.55; }
        .ic__link { color: var(--lp-brass-bright); font-size: 0.8rem; }
      `}</style>
    </div>
  );
}
