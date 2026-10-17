"use client";

import { useState } from "react";
import { useAccount, useReadContracts, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { formatUnits, parseUnits } from "viem";
import { wagmiConfig } from "@/lib/launchpad/wagmiConfig";
import { SALE_ROUND_ABI, ERC20_ABI } from "@/lib/launchpad/saleAbi";
import { ACTIVE_CHAIN } from "@/lib/launchpad/chain";
import { USDT_DECIMALS } from "@/lib/launchpad/contracts";

// Admin-only emergency and refund controls for a round that has its own
// contract. Every action is a transaction signed by the connected wallet and
// only succeeds if that wallet is the contract owner.
export function RoundAdminControls({ round }) {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [days, setDays] = useState("60");

  const round_ = round.contract_address;
  const base = { address: round_, abi: SALE_ROUND_ABI, chainId: ACTIVE_CHAIN.id };
  const { data, refetch } = useReadContracts({
    contracts: [
      { ...base, functionName: "raised" },
      { ...base, functionName: "paused" },
      { ...base, functionName: "refundsOpen" },
      { ...base, functionName: "finalized" },
      { ...base, functionName: "refundDeadline" },
      { ...base, functionName: "totalRefunded" },
      { ...base, functionName: "usdt" },
    ],
  });
  const raised = data?.[0]?.result ?? 0n;
  const paused = data?.[1]?.result === true;
  const refundsOpen = data?.[2]?.result === true;
  const finalized = data?.[3]?.result === true;
  const deadline = Number(data?.[4]?.result || 0);
  const totalRefunded = data?.[5]?.result ?? 0n;
  const usdt = data?.[6]?.result;

  const { data: bal, refetch: refetchBal } = useReadContracts({
    contracts: usdt ? [{ address: usdt, abi: ERC20_ABI, functionName: "balanceOf", args: [round_], chainId: ACTIVE_CHAIN.id }] : [],
    query: { enabled: !!usdt },
  });
  const balance = bal?.[0]?.result ?? 0n;
  const fmt = (v) => Number(formatUnits(v, USDT_DECIMALS)).toLocaleString(undefined, { maximumFractionDigits: 2 });
  const afterWindow = deadline && Date.now() / 1000 > deadline;

  const run = async (label, req) => {
    if (!address) return setMsg("Connect the admin wallet first.");
    setBusy(true);
    setMsg(`${label}: confirm in your wallet…`);
    try {
      const hash = await writeContractAsync({ ...req, chainId: ACTIVE_CHAIN.id });
      setMsg(`${label}: waiting for confirmation…`);
      await waitForTransactionReceipt(wagmiConfig, { hash, chainId: ACTIVE_CHAIN.id });
      setMsg(`${label}: done ✓`);
      refetch();
      refetchBal();
    } catch (e) {
      setMsg(`${label}: ${e?.shortMessage || "failed or rejected."}`);
    }
    setBusy(false);
  };

  const sendRefundFunds = () => {
    const need = raised > balance ? raised - balance : 0n;
    if (need === 0n) return setMsg("The contract already holds the full refund amount.");
    if (!window.confirm(`Send ${fmt(need)} USDT from your connected wallet to this round contract (${round_})?`)) return;
    run("Send refund funds", { address: usdt, abi: ERC20_ABI, functionName: "transfer", args: [round_, need] });
  };
  const openRefunds = () => {
    const d = Number(days);
    if (!Number.isInteger(d) || d < 30 || d > 365) return setMsg("Claim window must be 30 to 365 days.");
    if (!window.confirm(`Open refunds with a ${d}-day claim window? This closes the sale permanently.`)) return;
    run("Open refunds", { ...base, functionName: "openRefunds", args: [d] });
  };
  const confirmRun = (label, text, req) => {
    if (window.confirm(text)) run(label, req);
  };

  const btn = { background: "var(--lp-panel)", color: "var(--lp-ink)", border: "1px solid var(--lp-line)", borderRadius: 8, padding: "0.4rem 0.75rem", fontSize: "0.78rem", cursor: "pointer" };
  const stat = finalized ? "Finalized" : refundsOpen ? "Refunds open" : paused ? "Paused" : "Sale active/ended";

  return (
    <details style={{ marginTop: "0.6rem", fontFamily: "var(--lp-font-body)" }}>
      <summary style={{ cursor: "pointer", fontSize: "0.8rem", color: "var(--lp-brass-bright)" }}>Contract controls · {stat}</summary>
      <div style={{ marginTop: "0.6rem", display: "grid", gap: "0.6rem", fontSize: "0.8rem" }}>
        <div style={{ color: "var(--lp-mute)", lineHeight: 1.6 }}>
          Raised on-chain: <strong style={{ color: "var(--lp-ink)" }}>{fmt(raised)} USDT</strong> · Held by contract: <strong style={{ color: "var(--lp-ink)" }}>{fmt(balance)} USDT</strong>
          {refundsOpen && <> · Refunded: <strong style={{ color: "var(--lp-ink)" }}>{fmt(totalRefunded)} USDT</strong></>}
        </div>

        {!refundsOpen && !finalized && (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button style={btn} disabled={busy} onClick={() => run(paused ? "Resume" : "Pause", { ...base, functionName: "setPaused", args: [!paused] })}>
              {paused ? "Resume sale" : "Pause sale"}
            </button>
            <button style={btn} disabled={busy} onClick={() => confirmRun("Close sale", "Close this sale now? This cannot be undone.", { ...base, functionName: "closeNow" })}>
              Close sale now
            </button>
          </div>
        )}

        {!refundsOpen && !finalized && (
          <div style={{ border: "1px solid var(--lp-line)", borderRadius: 10, padding: "0.7rem", display: "grid", gap: "0.5rem" }}>
            <strong>Refund this round</strong>
            <span style={{ color: "var(--lp-mute)", lineHeight: 1.5 }}>
              1) Send the raised USDT back to the contract. 2) Open refunds. Investors then claim their own contribution. The contract refuses to open refunds until it holds the full amount.
            </span>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
              <button style={btn} disabled={busy || balance >= raised} onClick={sendRefundFunds}>
                1. Send refund funds
              </button>
              <input value={days} onChange={(e) => setDays(e.target.value)} inputMode="numeric" aria-label="Claim window in days" style={{ width: 56, background: "var(--lp-void)", color: "var(--lp-ink)", border: "1px solid var(--lp-line)", borderRadius: 6, padding: "0.35rem" }} />
              <span style={{ color: "var(--lp-mute)" }}>days</span>
              <button style={btn} disabled={busy || balance < raised} onClick={openRefunds}>
                2. Open refunds
              </button>
            </div>
          </div>
        )}

        {refundsOpen && !finalized && (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ color: "var(--lp-mute)" }}>Claim window ends {deadline ? new Date(deadline * 1000).toLocaleString() : "—"}</span>
            <button style={btn} disabled={busy || !afterWindow} onClick={() => confirmRun("Sweep unclaimed", "Return all unclaimed USDT to the treasury?", { ...base, functionName: "sweepUnclaimed" })}>
              Sweep unclaimed (after window)
            </button>
          </div>
        )}

        {!refundsOpen && !finalized && (
          <button style={{ ...btn, justifySelf: "start" }} disabled={busy} onClick={() => confirmRun("Finalize", "Finalize this round? Refunds can never be opened afterwards.", { ...base, functionName: "finalize" })}>
            Finalize round (permanently disables refunds)
          </button>
        )}

        {msg && <span style={{ color: "var(--lp-mute)" }}>{msg}</span>}
      </div>
    </details>
  );
}
