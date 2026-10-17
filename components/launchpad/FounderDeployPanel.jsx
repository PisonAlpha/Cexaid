"use client";

import { useState } from "react";
import { useAccount, useReadContract, useSwitchChain, useWriteContract } from "wagmi";
import { waitForTransactionReceipt, readContract, simulateContract } from "@wagmi/core";
import { wagmiConfig } from "@/lib/launchpad/wagmiConfig";
import { SALE_FACTORY_ABI, ERC20_ABI } from "@/lib/launchpad/saleAbi";
import { ACTIVE_CHAIN, SALE_FACTORY_ADDRESS } from "@/lib/launchpad/chain";
import { fmtUnits } from "@/lib/launchpad/units";
import { useLaunchpad } from "@/lib/launchpad/LaunchpadContext";
import { WalletConnectButton } from "./WalletConnectButton";

const short = (a) => (a ? `${a.slice(0, 8)}…${a.slice(-6)}` : "—");

// Turns a failed simulation into a plain explanation instead of a wallet that just says "fee unavailable".
const REASONS = {
  NotFounder: "The connected wallet is not this listing's founder wallet.",
  BadApproval: "CEXAID's approval was rejected by the factory. The site's approver key or factory address does not match the deployed factory. Restart the site after changing .env.local.",
  ApprovalExpired: "The approval expired. Click deploy again to get a fresh one.",
  ApprovalUsed: "This approval was already used. Click deploy again to get a fresh one.",
  InvalidParams: "The contract rejected the round terms (dates, ticket sizes, price, token or vesting). Check the listing.",
};
function explain(e) {
  const hit = typeof e?.walk === "function" ? e.walk((x) => x?.data?.errorName) : null;
  const name = hit?.data?.errorName;
  return REASONS[name] || e?.shortMessage || e?.message || "Deployment failed or was rejected.";
}

// Shown only to the project's founder, on an approved round that has no contract yet.
// The founder deploys their own sale contract and pays the listing fee to the CEXAID
// treasury in the same transaction. CEXAID's signed approval is what authorises it.
export function FounderDeployPanel({ round, project }) {
  const { address, chainId: walletChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { refresh } = useLaunchpad();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);

  const chainId = ACTIVE_CHAIN.id;
  const factory = SALE_FACTORY_ADDRESS || undefined;
  const fee = useReadContract({ address: factory, abi: SALE_FACTORY_ABI, functionName: "listingFee", chainId, query: { enabled: !!factory } });
  const usdt = useReadContract({ address: factory, abi: SALE_FACTORY_ABI, functionName: "usdt", chainId, query: { enabled: !!factory } });
  const bal = useReadContract({
    address: usdt.data, abi: ERC20_ABI, functionName: "balanceOf", args: [address], chainId,
    query: { enabled: !!usdt.data && !!address, refetchInterval: 10000 },
  });

  const isFounder = address && project.founderWallet && address.toLowerCase() === project.founderWallet.toLowerCase();
  const feeText = fee.data != null ? `${fmtUnits(fee.data, 18, 2)} USDT` : "the listing fee";

  async function wait(hash) {
    await waitForTransactionReceipt(wagmiConfig, { hash, chainId });
  }

  async function deploy() {
    setBusy(true);
    setMsg("Preparing your deployment…");
    try {
      if (!factory) throw new Error("The sale factory is not configured.");
      if (walletChainId !== chainId) {
        setMsg(`Switching your wallet to ${ACTIVE_CHAIN.name}… confirm in your wallet.`);
        await switchChainAsync({ chainId });
      }
      if (fee.data == null || !usdt.data) throw new Error("Could not read the factory yet. Try again in a moment.");
      if ((bal.data ?? 0n) < fee.data) throw new Error(`You need ${feeText} (BEP20 USDT) in this wallet to deploy. You have ${fmtUnits(bal.data ?? 0n, 18, 2)}.`);

      // Fresh approval from CEXAID for exactly this round's terms.
      const res = await fetch("/api/launchpad/deploy-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roundId: round.id }),
      }).then((r) => r.json());
      if (!res.ok) throw new Error(res.error || "CEXAID could not prepare the approval.");
      const t = res.terms;
      const terms = {
        startTime: BigInt(t.startTime), endTime: BigInt(t.endTime),
        minTicket: BigInt(t.minTicket), maxTicket: BigInt(t.maxTicket), hardCap: BigInt(t.hardCap),
        token: t.token, founder: t.founder, priceUsdt: BigInt(t.priceUsdt),
        tgeTime: BigInt(t.tgeTime), tgeBps: t.tgeBps, cliffSeconds: t.cliffSeconds, vestingSeconds: t.vestingSeconds,
      };

      // Step 1: let the factory take the listing fee (skipped if already allowed).
      const allowance = await fetchAllowance();
      if (allowance < fee.data) {
        setMsg(`Step 1 of 2: approve ${feeText} for the listing fee. Confirm in your wallet…`);
        const h1 = await writeContractAsync({ address: usdt.data, abi: ERC20_ABI, functionName: "approve", args: [factory, fee.data], chainId });
        setMsg("Step 1 of 2: waiting for confirmation…");
        await wait(h1);
      }

      // Dry-run first, so a problem shows up here as a clear reason instead of a failed wallet prompt.
      setMsg("Checking the deployment…");
      await simulateContract(wagmiConfig, {
        address: factory, abi: SALE_FACTORY_ABI, functionName: "createRound",
        args: [res.slug, terms, BigInt(res.deadline), res.signature], account: address, chainId,
      });

      // Step 2: deploy the round. The fee goes to the CEXAID treasury in the same transaction.
      setMsg(`Step 2 of 2: deploy your sale contract and pay ${feeText}. Confirm in your wallet…`);
      const h2 = await writeContractAsync({
        address: factory, abi: SALE_FACTORY_ABI, functionName: "createRound",
        args: [res.slug, terms, BigInt(res.deadline), res.signature], chainId,
      });
      setMsg("Step 2 of 2: waiting for confirmation…");
      await wait(h2);

      setMsg("Contract deployed. Linking it to your listing…");
      const link = await fetch("/api/launchpad/round-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roundId: round.id, txHash: h2 }),
      }).then((r) => r.json());
      if (!link.ok) throw new Error(link.error || "Deployed, but linking failed. Refresh the page; if it persists contact CEXAID with your transaction hash.");
      setDone(true);
      setMsg("Your sale contract is live. Next: deposit your tokens into it.");
      await refresh?.();
    } catch (e) {
      setMsg(explain(e));
    }
    setBusy(false);
  }

  async function fetchAllowance() {
    return readContract(wagmiConfig, { address: usdt.data, abi: ERC20_ABI, functionName: "allowance", args: [address, factory], chainId });
  }

  return (
    <div className="fd">
      <h4>Founder: deploy your sale contract</h4>
      <p className="fd__note">
        CEXAID has approved your private sale. Deploy its smart contract from your founder wallet. The contract is yours to
        fund: you then deposit your tokens into it, and the sale opens once they are in. Investors claim from this contract
        on the vesting schedule you set.
      </p>
      <ul className="fd__list">
        <li><span>Listing fee</span><b>{feeText}, paid to the CEXAID treasury (non-refundable)</b></li>
        <li><span>Founder wallet</span><b>{short(project.founderWallet)}</b></li>
        <li><span>Your USDT balance</span><b>{address && bal.data != null ? `${fmtUnits(bal.data, 18, 2)} USDT` : "—"}</b></li>
        <li><span>Terms</span><b>Fixed to what CEXAID approved. They cannot be changed at deployment.</b></li>
      </ul>

      {!address ? (
        <WalletConnectButton />
      ) : !isFounder ? (
        <p className="fd__warn">Connect the founder wallet {short(project.founderWallet)} to deploy. You are connected as {short(address)}.</p>
      ) : done ? null : (
        <button className="fd__btn" onClick={deploy} disabled={busy}>
          {busy ? "Working…" : `Deploy sale contract · pay ${feeText}`}
        </button>
      )}
      {msg && <p className="fd__msg">{msg}</p>}

      <style jsx>{`
        .fd { font-family: var(--lp-font-body); background: var(--lp-panel); border: 1px solid var(--lp-brass); border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.9rem; }
        .fd h4 { margin: 0; color: var(--lp-ink); font-family: var(--lp-font-display); font-size: 1.05rem; }
        .fd__note { margin: 0; color: var(--lp-mute); font-size: 0.85rem; line-height: 1.6; }
        .fd__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.45rem; }
        .fd__list li { display: flex; justify-content: space-between; gap: 1rem; font-size: 0.8rem; border-bottom: 1px solid var(--lp-line); padding-bottom: 0.45rem; }
        .fd__list span { color: var(--lp-mute); }
        .fd__list b { color: var(--lp-ink); text-align: right; font-weight: 500; }
        .fd__btn { background: var(--lp-brass); color: var(--lp-on-accent); border: 0; border-radius: 8px; padding: 0.7rem 1rem; font-weight: 600; cursor: pointer; font-size: 0.9rem; }
        .fd__btn:disabled { opacity: 0.6; cursor: default; }
        .fd__warn { margin: 0; color: #f5c451; font-size: 0.82rem; }
        .fd__msg { margin: 0; color: var(--lp-mute); font-size: 0.8rem; line-height: 1.5; }
      `}</style>
    </div>
  );
}
