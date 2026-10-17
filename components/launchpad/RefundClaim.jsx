"use client";

import { useState } from "react";
import { useAccount, useReadContracts, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { formatUnits } from "viem";
import { wagmiConfig } from "@/lib/launchpad/wagmiConfig";
import { SALE_ROUND_ABI } from "@/lib/launchpad/saleAbi";
import { ACTIVE_CHAIN, explorerTxUrl } from "@/lib/launchpad/chain";
import { USDT_DECIMALS } from "@/lib/launchpad/contracts";

// Shown on a round page only while refunds are open for this round's contract.
// The investor claims their own contribution back from the contract.
export function RefundClaim({ round }) {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [tx, setTx] = useState("");

  const base = { address: round.contractAddress, abi: SALE_ROUND_ABI, chainId: ACTIVE_CHAIN.id };
  const { data, refetch } = useReadContracts({
    contracts: [
      { ...base, functionName: "refundsOpen" },
      { ...base, functionName: "refundDeadline" },
      ...(address
        ? [
            { ...base, functionName: "contributed", args: [address] },
            { ...base, functionName: "refunded", args: [address] },
          ]
        : []),
    ],
    query: { refetchInterval: 30000 },
  });

  const open = data?.[0]?.result === true;
  if (!open) return null;

  const deadline = Number(data?.[1]?.result || 0);
  const contributed = address ? data?.[2]?.result ?? 0n : 0n;
  const already = address ? data?.[3]?.result === true : false;
  const amount = Number(formatUnits(contributed, USDT_DECIMALS)).toLocaleString(undefined, { maximumFractionDigits: 2 });
  const deadlineText = deadline ? new Date(deadline * 1000).toLocaleString() : "";
  const expired = deadline && Date.now() / 1000 > deadline;

  const claim = async () => {
    setBusy(true);
    setMsg("Confirm in your wallet…");
    try {
      const hash = await writeContractAsync({ ...base, functionName: "claimRefund" });
      setMsg("Waiting for confirmation…");
      await waitForTransactionReceipt(wagmiConfig, { hash, chainId: ACTIVE_CHAIN.id });
      setTx(hash);
      setMsg("Refund sent to your wallet ✓");
      refetch();
    } catch (e) {
      setMsg(e?.shortMessage || "Claim failed or was rejected.");
    }
    setBusy(false);
  };

  return (
    <div style={{ border: "1px solid var(--lp-brass)", background: "var(--lp-panel-raised)", borderRadius: 12, padding: "1rem 1.1rem", margin: "0.75rem 0", fontFamily: "var(--lp-font-body)" }}>
      <strong style={{ display: "block", marginBottom: "0.3rem" }}>Refunds are open for this round</strong>
      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--lp-mute)", lineHeight: 1.55 }}>
        Contributors can claim their USDT back directly from the sale contract.
        {deadlineText && ` Claim before ${deadlineText}.`}
      </p>
      {!address && <p style={{ margin: "0.6rem 0 0", fontSize: "0.85rem" }}>Connect the wallet you contributed from to check your refund.</p>}
      {address && contributed === 0n && <p style={{ margin: "0.6rem 0 0", fontSize: "0.85rem" }}>This wallet made no contribution to this round.</p>}
      {address && contributed > 0n && already && <p style={{ margin: "0.6rem 0 0", fontSize: "0.85rem", color: "var(--lp-signal-green)" }}>✓ Your {amount} USDT refund has been claimed.</p>}
      {address && contributed > 0n && !already && (
        <button
          onClick={claim}
          disabled={busy || expired}
          style={{ marginTop: "0.7rem", background: "var(--lp-brass)", color: "var(--lp-on-accent)", border: 0, borderRadius: 8, padding: "0.55rem 1.1rem", fontWeight: 600, cursor: "pointer" }}
        >
          {busy ? "Working…" : expired ? "Claim window ended" : `Claim ${amount} USDT`}
        </button>
      )}
      {msg && <p style={{ margin: "0.5rem 0 0", fontSize: "0.8rem", color: "var(--lp-mute)" }}>{msg}</p>}
      {tx && (
        <a href={explorerTxUrl(tx)} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.78rem", color: "var(--lp-brass-bright)" }}>
          View transaction ↗
        </a>
      )}
    </div>
  );
}
