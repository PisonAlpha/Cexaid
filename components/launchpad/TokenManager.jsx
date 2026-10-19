"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount, useReadContracts, useSwitchChain } from "wagmi";
import { waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { isAddress, zeroAddress } from "viem";
import { wagmiConfig } from "@/lib/launchpad/wagmiConfig";
import { ACTIVE_CHAIN, explorerAddressUrl } from "@/lib/launchpad/chain";
import { ABI, pctToBps } from "@/lib/tokencreator/params";
import { DEX, FACTORY_ABI, pancakeAddLiquidityUrl } from "@/lib/tokencreator/dex";
import { fmtUnits } from "@/lib/launchpad/units";
import { WalletConnectButton } from "./WalletConnectButton";

const short = (a) => (a ? `${a.slice(0, 8)}…${a.slice(-6)}` : "—");
const same = (a, b) => !!a && !!b && a.toLowerCase() === b.toLowerCase();

function explain(e) {
  const m = e?.shortMessage || e?.message || "";
  if (/user rejected|user denied|rejected the request/i.test(m)) return "You cancelled the transaction in your wallet.";
  if (/LimitsCanOnlyBeLoosened/i.test(m)) return "Limits can only be loosened or removed, never tightened.";
  if (/InvalidPair/i.test(m)) return "That address is not a PancakeSwap V2 pair that holds this token. Add liquidity first, then use the pair address.";
  if (/PairAlreadyRegistered/i.test(m)) return "That pair is already registered.";
  if (/OwnableUnauthorizedAccount/i.test(m)) return "Only the token owner can do this.";
  return m || "The transaction failed or was rejected.";
}

export function TokenManager({ address: token }) {
  const { address: me, chainId: walletChainId, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const chainId = ACTIVE_CHAIN.id;
  const valid = isAddress(token || "");

  const [pairInput, setPairInput] = useState("");
  const [newTx, setNewTx] = useState("");
  const [newWallet, setNewWallet] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [understand, setUnderstand] = useState(false);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const c = { address: token, abi: ABI.tax, chainId };
  const base = useReadContracts({
    allowFailure: true,
    query: { enabled: valid, refetchInterval: 15000 },
    contracts: [
      { ...c, functionName: "name" }, { ...c, functionName: "symbol" }, { ...c, functionName: "decimals" }, { ...c, functionName: "totalSupply" },
      { ...c, functionName: "owner" }, { ...c, functionName: "buyTaxBps" }, { ...c, functionName: "sellTaxBps" }, { ...c, functionName: "taxWallet" },
      { ...c, functionName: "maxTxAmount" }, { ...c, functionName: "maxWalletAmount" },
    ],
  });
  const r = (i) => (base.data?.[i]?.status === "success" ? base.data[i].result : undefined);
  const [name, symbol, decimals, supply, owner, buyBps, sellBps, taxWallet, maxTx, maxWallet] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(r);
  const isToken = name !== undefined && decimals !== undefined && supply !== undefined;
  const isTax = buyBps !== undefined && sellBps !== undefined;
  const renounced = isTax && owner === zeroAddress;
  const isOwner = isTax && same(me, owner);

  // Convenience: look up the PancakeSwap V2 pairs this token would have (BNB and USDT).
  const pairsQ = useReadContracts({
    allowFailure: true,
    query: { enabled: valid && isTax, refetchInterval: 20000 },
    contracts: [
      { address: DEX.factory, abi: FACTORY_ABI, functionName: "getPair", args: [token, DEX.wbnb], chainId },
      { address: DEX.factory, abi: FACTORY_ABI, functionName: "getPair", args: [token, DEX.usdt], chainId },
    ],
  });
  const found = [["BNB pair", pairsQ.data?.[0]], ["USDT pair", pairsQ.data?.[1]]]
    .filter(([, x]) => x?.status === "success" && x.result && x.result !== zeroAddress)
    .map(([label, x]) => ({ label, pair: x.result }));
  const pairFlags = useReadContracts({
    allowFailure: true,
    query: { enabled: valid && isTax && found.length > 0, refetchInterval: 15000 },
    contracts: found.map((p) => ({ ...c, functionName: "isPair", args: [p.pair] })),
  });
  const flagOf = (i) => pairFlags.data?.[i]?.status === "success" && pairFlags.data[i].result === true;
  const anyRegistered = found.some((_, i) => flagOf(i));

  const pct = (amount) => {
    if (!supply || amount === undefined || amount === 0n) return "No limit";
    return `${(Number((amount * 10000n) / supply) / 100).toFixed(2)}% of supply (${fmtUnits(amount, decimals, 0)} ${symbol})`;
  };

  async function send(label, fn, args) {
    setErr(""); setMsg(""); setBusy(label);
    try {
      if (walletChainId !== chainId) {
        setMsg(`Switching your wallet to ${ACTIVE_CHAIN.name}…`);
        await switchChainAsync({ chainId });
      }
      setMsg("Confirm in your wallet. You only pay the network fee.");
      const hash = await writeContract(wagmiConfig, { address: token, abi: ABI.tax, functionName: fn, args, chainId });
      setMsg("Waiting for the transaction to confirm…");
      await waitForTransactionReceipt(wagmiConfig, { hash, chainId });
      setMsg(`Done. ${label} confirmed.`);
      await Promise.all([base.refetch(), pairsQ.refetch(), pairFlags.refetch()]);
      return hash;
    } catch (e) {
      setErr(explain(e)); setMsg("");
    } finally {
      setBusy("");
    }
  }

  const registerPair = (pair) => send("Pair registered", "registerPair", [pair]);

  function applyLimits() {
    setErr("");
    const parse = (text, current) => {
      const t = text.trim();
      if (t === "") return current ?? 0n;
      const bps = pctToBps(t);
      if (bps == null || bps < 10 || bps > 10000) return null;
      return (supply * BigInt(bps)) / 10_000n;
    };
    const a = parse(newTx, maxTx);
    const b = parse(newWallet, maxWallet);
    if (a == null || b == null) { setErr("Enter limits as a percentage of supply between 0.1 and 100, or leave a box empty to keep it as it is."); return; }
    send("Limits updated", "loosenLimits", [a, b]);
  }

  const removeLimits = () => send("Limits removed", "loosenLimits", [0n, 0n]);

  const renounce = () => send("Ownership renounced", "renounceOwnership", []);
  const canRenounce = confirmText.trim().toUpperCase() === "RENOUNCE" && (anyRegistered || understand);

  if (!valid) {
    return <div className="tm"><div className="tm__card"><p>That is not a valid token address.</p><Link href="/launchpad/create-token">← Back to the token creator</Link></div><Styles /></div>;
  }
  if (base.isLoading) return <div className="tm"><div className="tm__card"><p>Reading the token from {ACTIVE_CHAIN.name}…</p></div><Styles /></div>;
  if (!isToken) {
    return (
      <div className="tm"><div className="tm__card">
        <p>No token was found at <code>{token}</code> on {ACTIVE_CHAIN.name}. Check the address, or try again in a moment if the network is slow.</p>
        <Link href="/launchpad/create-token">← Back to the token creator</Link>
      </div><Styles /></div>
    );
  }

  return (
    <div className="tm">
      <div className="tm__card">
        <span className="tm__eyebrow">{isTax ? "Tax token" : "Standard token"}</span>
        <h2>{name} <small>({symbol})</small></h2>
        <dl className="tm__facts">
          <div><dt>Contract</dt><dd><a href={explorerAddressUrl(token)} target="_blank" rel="noopener noreferrer">{short(token)} ↗</a></dd></div>
          <div><dt>Total supply</dt><dd>{fmtUnits(supply, decimals, 0)} {symbol} (fixed, nobody can mint)</dd></div>
          <div><dt>Decimals</dt><dd>{decimals}</dd></div>
          {isTax ? (
            <>
              <div><dt>Buy tax</dt><dd>{(Number(buyBps) / 100).toFixed(2)}% (fixed forever)</dd></div>
              <div><dt>Sell tax</dt><dd>{(Number(sellBps) / 100).toFixed(2)}% (fixed forever)</dd></div>
              <div><dt>Tax wallet</dt><dd><a href={explorerAddressUrl(taxWallet)} target="_blank" rel="noopener noreferrer">{short(taxWallet)} ↗</a></dd></div>
              <div><dt>Max transaction</dt><dd>{pct(maxTx)}</dd></div>
              <div><dt>Max wallet</dt><dd>{pct(maxWallet)}</dd></div>
              <div><dt>Owner</dt><dd>{renounced ? "Renounced. The rules are locked." : <a href={explorerAddressUrl(owner)} target="_blank" rel="noopener noreferrer">{short(owner)} ↗</a>}</dd></div>
            </>
          ) : (
            <div><dt>Owner</dt><dd>None. This token has no owner and no admin functions.</dd></div>
          )}
        </dl>
        <p className="tm__small">This page reads the contract directly from the chain. CEXAID did not review this token and does not endorse it.</p>
      </div>

      {isTax && (
        <>
          <div className="tm__card">
            <h3>Trading pair</h3>
            <p className="tm__small">Tax only applies to trades against a registered pair. Add liquidity on PancakeSwap V2 first, then register the pair here. You are exempt from the tax while adding liquidity. Registered pairs can never be removed.</p>
            <a className="tm__link" href={pancakeAddLiquidityUrl(token)} target="_blank" rel="noopener noreferrer">Add liquidity on PancakeSwap ↗</a>
            {found.length === 0 && <p className="tm__small">No PancakeSwap V2 pair found yet for BNB or USDT. It appears after you add liquidity.</p>}
            {found.map((p, i) => (
              <div className="tm__pair" key={p.pair}>
                <div><b>{p.label}</b> <code>{short(p.pair)}</code></div>
                {flagOf(i) ? <span className="tm__yes">✓ Registered</span> : isOwner ? (
                  <button className="tm__btn" disabled={!!busy} onClick={() => registerPair(p.pair)}>{busy === "Pair registered" ? "Working…" : "Register this pair"}</button>
                ) : <span className="tm__small">Not registered yet</span>}
              </div>
            ))}
            {isOwner && (
              <div className="tm__pair">
                <input value={pairInput} onChange={(e) => setPairInput(e.target.value)} placeholder="Or paste another pair address (0x…)" spellCheck={false} />
                <button className="tm__btn tm__btn--ghost" disabled={!!busy || !isAddress(pairInput.trim())} onClick={() => registerPair(pairInput.trim())}>Register</button>
              </div>
            )}
          </div>

          {!isConnected && <div className="tm__card"><p className="tm__small">Connect the owner wallet to make changes.</p><WalletConnectButton /></div>}
          {isConnected && !isOwner && !renounced && <div className="tm__card"><p className="tm__small">You are connected as {short(me)}. Only the owner ({short(owner)}) can make changes.</p></div>}

          {isOwner && (
            <>
              {(maxTx > 0n || maxWallet > 0n) && (
                <div className="tm__card">
                  <h3>Limits</h3>
                  <p className="tm__small">You can raise or remove limits. You can never make them stricter. Leave a box empty to keep that limit as it is.</p>
                  <div className="tm__row">
                    <label>Max transaction (% of supply)<input value={newTx} onChange={(e) => setNewTx(e.target.value)} placeholder={maxTx > 0n ? "keep" : "none"} disabled={maxTx === 0n} inputMode="decimal" /></label>
                    <label>Max wallet (% of supply)<input value={newWallet} onChange={(e) => setNewWallet(e.target.value)} placeholder={maxWallet > 0n ? "keep" : "none"} disabled={maxWallet === 0n} inputMode="decimal" /></label>
                  </div>
                  <div className="tm__actions">
                    <button className="tm__btn" disabled={!!busy || (!newTx.trim() && !newWallet.trim())} onClick={applyLimits}>Apply new limits</button>
                    <button className="tm__btn tm__btn--ghost" disabled={!!busy} onClick={removeLimits}>Remove all limits</button>
                  </div>
                </div>
              )}

              <div className="tm__card tm__danger">
                <h3>Renounce ownership</h3>
                <p className="tm__small">
                  This permanently gives up the owner role. After it you can no longer register a pair or change limits, and nobody ever can. The tax rates, tax wallet and supply never change either way. It cannot be undone.
                </p>
                {!anyRegistered && (
                  <label className="tm__check">
                    <input type="checkbox" checked={understand} onChange={(e) => setUnderstand(e.target.checked)} />
                    No pair is registered yet. I understand tax will never apply to a pair I add later.
                  </label>
                )}
                <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="Type RENOUNCE to confirm" />
                <div className="tm__actions">
                  <button className="tm__btn tm__btn--red" disabled={!!busy || !canRenounce} onClick={renounce}>Renounce ownership</button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {err && <p className="tm__error" role="alert">{err}</p>}
      {msg && <p className="tm__msg">{msg}</p>}
      <Link className="tm__link" href="/launchpad/create-token">← Create another token</Link>
      <Styles />
    </div>
  );
}

function Styles() {
  return (
    <style jsx global>{`
      .tm { display: flex; flex-direction: column; gap: 1.1rem; }
      .tm__card { background: var(--lp-panel); border: 1px solid var(--lp-line); padding: 1.4rem; display: flex; flex-direction: column; gap: 0.9rem; }
      .tm__card h2 { margin: 0; font-size: 1.4rem; }
      .tm__card h2 small { color: var(--lp-mute); font-weight: 500; font-size: 0.95rem; }
      .tm__card h3 { margin: 0; font-size: 1.02rem; color: var(--lp-brass-bright); }
      .tm__eyebrow { font-family: var(--lp-font-mono); font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--lp-brass-bright); }
      .tm__facts { margin: 0; display: grid; gap: 0.5rem; }
      .tm__facts div { display: grid; grid-template-columns: 9rem 1fr; gap: 0.8rem; font-size: 0.88rem; }
      @media (max-width: 520px) { .tm__facts div { grid-template-columns: 1fr; gap: 0.1rem; } }
      .tm__facts dt { color: var(--lp-mute); font-family: var(--lp-font-mono); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; padding-top: 0.15rem; }
      .tm__facts dd { margin: 0; word-break: break-word; }
      .tm__facts a, .tm__link { color: var(--lp-brass-bright); text-decoration: none; font-size: 0.88rem; }
      .tm__small { margin: 0; font-size: 0.8rem; line-height: 1.55; color: var(--lp-mute); }
      .tm__pair { display: flex; gap: 0.7rem; align-items: center; justify-content: space-between; flex-wrap: wrap; background: var(--lp-panel-raised); border: 1px solid var(--lp-line); padding: 0.7rem 0.9rem; font-size: 0.86rem; }
      .tm__pair input, .tm__card > input, .tm__row input { background: var(--lp-panel-raised); border: 1px solid var(--lp-line); border-radius: 2px; color: var(--lp-ink); padding: 0.55rem 0.7rem; font-family: var(--lp-font-body); font-size: 0.9rem; min-width: 0; }
      .tm__pair input { flex: 1; }
      .tm__yes { color: var(--lp-signal-green); font-weight: 600; font-size: 0.84rem; }
      .tm__row { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 0.9rem; }
      .tm__row label { display: flex; flex-direction: column; gap: 0.35rem; font-family: var(--lp-font-mono); font-size: 0.7rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--lp-mute); }
      .tm__check { display: flex; gap: 0.6rem; align-items: flex-start; font-size: 0.82rem; line-height: 1.5; color: var(--lp-ink); }
      .tm__actions { display: flex; gap: 0.7rem; flex-wrap: wrap; }
      .tm__btn { background: var(--lp-brass); color: var(--lp-on-accent); border: 1px solid var(--lp-brass); padding: 0.6rem 1.1rem; border-radius: 2px; font-family: var(--lp-font-body); font-weight: 600; font-size: 0.88rem; cursor: pointer; }
      .tm__btn:disabled { opacity: 0.5; cursor: not-allowed; }
      .tm__btn--ghost { background: transparent; color: var(--lp-ink); border-color: var(--lp-line); }
      .tm__btn--red { background: var(--lp-signal-red); border-color: var(--lp-signal-red); }
      .tm__danger { border-color: rgba(234, 57, 67, 0.5); }
      .tm__error { margin: 0; color: var(--lp-signal-red); font-size: 0.86rem; }
      .tm__msg { margin: 0; color: var(--lp-brass-bright); font-size: 0.86rem; }
      .tm code { font-size: 0.82rem; word-break: break-all; }
    `}</style>
  );
}
