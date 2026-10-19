"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAccount, useSwitchChain } from "wagmi";
import { deployContract, estimateGas, getGasPrice, waitForTransactionReceipt, watchAsset } from "@wagmi/core";
import { encodeDeployData, formatEther, isAddress } from "viem";
import { wagmiConfig } from "@/lib/launchpad/wagmiConfig";
import { ACTIVE_CHAIN, explorerAddressUrl, explorerTxUrl } from "@/lib/launchpad/chain";
import { ABI, BYTECODE, constructorArgs, encodedConstructorArgs, fmtWhole, parseWholeSupply, validateForm } from "@/lib/tokencreator/params";
import { pancakeAddLiquidityUrl } from "@/lib/tokencreator/dex";
import { WalletConnectButton } from "./WalletConnectButton";

const EMPTY = { name: "", symbol: "", supply: "", decimals: "18", buyTax: "", sellTax: "", taxWallet: "", maxTx: "", maxWallet: "" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function explain(e) {
  const m = e?.shortMessage || e?.message || "";
  if (/user rejected|user denied|rejected the request/i.test(m)) return "You cancelled the transaction in your wallet.";
  if (/insufficient funds/i.test(m)) return "Not enough BNB in this wallet to pay the network fee.";
  return m || "The deployment failed or was rejected.";
}

export function TokenCreator() {
  const router = useRouter();
  const { address, chainId: walletChainId, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const chainId = ACTIVE_CHAIN.id;

  const [kind, setKind] = useState("standard");
  const [f, setF] = useState(EMPTY);
  const [showErrors, setShowErrors] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null);
  const [verify, setVerify] = useState({ state: "idle", message: "" });
  const [fee, setFee] = useState(null);
  const [lookup, setLookup] = useState("");
  const taxTouched = useRef(false);
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);

  const set = (k) => (e) => {
    if (k === "taxWallet") taxTouched.current = true;
    setF((p) => ({ ...p, [k]: e.target.value }));
  };

  // Tax wallet defaults to the connected wallet until the user types their own.
  useEffect(() => {
    if (kind === "tax" && address && !taxTouched.current) setF((p) => ({ ...p, taxWallet: address }));
  }, [kind, address]);

  const check = useMemo(() => validateForm(kind, f, address), [kind, f, address]);
  const err_ = (k) => (showErrors ? check.errors[k] : (f[k] ? check.errors[k] : ""));

  // Best-effort network fee estimate once the form is valid.
  useEffect(() => {
    setFee(null);
    if (!check.ok || !address) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const data = encodeDeployData({ abi: ABI[kind], bytecode: BYTECODE[kind], args: constructorArgs(kind, check.values) });
        const [gas, price] = await Promise.all([
          estimateGas(wagmiConfig, { account: address, data, chainId }),
          getGasPrice(wagmiConfig, { chainId }),
        ]);
        if (!cancelled) setFee(Number(formatEther(gas * price)));
      } catch { /* the estimate is optional */ }
    }, 500);
    return () => { cancelled = true; clearTimeout(t); };
  }, [kind, check, address, chainId]);

  async function runVerify(k, tokenAddress, argsHex) {
    setVerify({ state: "submitting", message: "Publishing the source code on BscScan…" });
    let guid = null;
    for (let i = 0; i < 9 && alive.current && !guid; i++) {
      try {
        const r = await fetch("/api/tokens/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: k, address: tokenAddress, constructorArgs: argsHex }),
        }).then((x) => x.json());
        if (r.ok && r.state === "verified") { setVerify({ state: "verified", message: "" }); return; }
        if (r.ok && r.guid) { guid = r.guid; break; }
        if (r.manual) { setVerify({ state: "manual", message: "" }); return; }
        if (!r.retry) { setVerify({ state: "failed", message: r.error || "" }); return; }
      } catch { /* try again */ }
      await sleep(10000);
    }
    if (!guid) { if (alive.current) setVerify({ state: "failed", message: "BscScan was slow to pick up the contract." }); return; }
    setVerify({ state: "pending", message: "Waiting for BscScan to finish…" });
    for (let i = 0; i < 24 && alive.current; i++) {
      await sleep(6000);
      try {
        const r = await fetch(`/api/tokens/verify?guid=${guid}`).then((x) => x.json());
        if (r.state === "verified") { setVerify({ state: "verified", message: "" }); return; }
        if (r.state === "failed") { setVerify({ state: "failed", message: r.message || "" }); return; }
      } catch { /* keep polling */ }
    }
    if (alive.current) setVerify({ state: "failed", message: "BscScan is taking longer than usual." });
  }

  async function create() {
    setErr("");
    setShowErrors(true);
    if (!check.ok) { setErr("Fix the highlighted fields first."); return; }
    if (!isConnected || !address) { setErr("Connect your wallet first."); return; }
    setBusy(true);
    try {
      if (walletChainId !== chainId) {
        setMsg(`Switching your wallet to ${ACTIVE_CHAIN.name}… confirm in your wallet.`);
        await switchChainAsync({ chainId });
      }
      const args = constructorArgs(kind, check.values);
      setMsg("Confirm the deployment in your wallet. You only pay the network fee.");
      const hash = await deployContract(wagmiConfig, { abi: ABI[kind], bytecode: BYTECODE[kind], args, chainId });
      setMsg("Deploying your token… this usually takes a few seconds.");
      const receipt = await waitForTransactionReceipt(wagmiConfig, { hash, chainId });
      if (receipt.status !== "success" || !receipt.contractAddress) throw new Error("The deployment transaction failed on-chain.");
      const argsHex = encodedConstructorArgs(kind, args);
      setResult({ kind, address: receipt.contractAddress, hash, symbol: check.values.symbol, decimals: check.values.decimals, name: check.values.name });
      setMsg("");
      runVerify(kind, receipt.contractAddress, argsHex);
    } catch (e) {
      setErr(explain(e));
      setMsg("");
    }
    setBusy(false);
  }

  async function addToWallet() {
    try {
      await watchAsset(wagmiConfig, { type: "ERC20", options: { address: result.address, symbol: result.symbol.slice(0, 11), decimals: result.decimals } });
    } catch { /* user dismissed */ }
  }

  function reset() {
    setResult(null); setVerify({ state: "idle", message: "" }); setF(EMPTY); setShowErrors(false); setErr(""); taxTouched.current = false;
  }

  // ---------------------------------------------------------------- success view
  if (result) {
    const isTax = result.kind === "tax";
    return (
      <div className="tc">
        <div className="tc__card tc__ok">
          <span className="tc__eyebrow">Token created</span>
          <h2>{result.name} <small>({result.symbol})</small></h2>
          <div className="tc__addr"><span>Contract address</span><code>{result.address}</code></div>
          <div className="tc__links">
            <a href={explorerAddressUrl(result.address)} target="_blank" rel="noopener noreferrer">View on BscScan ↗</a>
            <a href={explorerTxUrl(result.hash)} target="_blank" rel="noopener noreferrer">Deployment transaction ↗</a>
            <button type="button" onClick={() => navigator.clipboard?.writeText(result.address)}>Copy address</button>
            <button type="button" onClick={addToWallet}>Add to my wallet</button>
          </div>
          <div className={`tc__verify tc__verify--${verify.state}`}>
            {verify.state === "verified" && <>✓ Source code verified on BscScan. Anyone can read it.</>}
            {(verify.state === "submitting" || verify.state === "pending") && <>⏳ {verify.message}</>}
            {(verify.state === "failed" || verify.state === "manual") && (
              <>Automatic verification did not finish{verify.message ? ` (${verify.message})` : ""}. Your token still works. You can verify it by hand from the BscScan page, or ask us for help.</>
            )}
          </div>
        </div>

        <div className="tc__card">
          <h3>What to do next</h3>
          {isTax ? (
            <ol className="tc__steps">
              <li><b>Add liquidity</b> on PancakeSwap V2 with your token and BNB. <a href={pancakeAddLiquidityUrl(result.address)} target="_blank" rel="noopener noreferrer">Open PancakeSwap ↗</a>. You are exempt from the tax while you do this.</li>
              <li><b>Register the trading pair</b> on the manage page. Tax only starts applying once the pair is registered.</li>
              <li><b>Optional:</b> renounce ownership on the manage page to lock the rules for good. Register your pair first, because you cannot add one after you renounce.</li>
            </ol>
          ) : (
            <ol className="tc__steps">
              <li>Your whole supply is in the wallet you deployed from. This token has no owner and no admin functions, so there is nothing more to set up.</li>
              <li>Add liquidity on a DEX, or <Link href="/launchpad/apply-private-sale">apply for a CEXAID private sale</Link> for it.</li>
            </ol>
          )}
          <div className="tc__actions">
            <Link className="tc__btn" href={`/launchpad/create-token/manage/${result.address}`}>{isTax ? "Open manage page" : "View token page"}</Link>
            <button type="button" className="tc__btn tc__btn--ghost" onClick={reset}>Create another token</button>
          </div>
        </div>
        <Styles />
      </div>
    );
  }

  // ---------------------------------------------------------------- form view
  const isTax = kind === "tax";
  const v = check.values;
  const supplyWhole = parseWholeSupply(f.supply);
  const goLookup = () => { if (isAddress(lookup.trim())) router.push(`/launchpad/create-token/manage/${lookup.trim()}`); };

  return (
    <div className="tc">
      <div className="tc__kinds" role="radiogroup" aria-label="Token type">
        <button type="button" role="radio" aria-checked={kind === "standard"} className={`tc__kind ${kind === "standard" ? "is-on" : ""}`} onClick={() => setKind("standard")}>
          <b>Standard token</b>
          <span>Fixed supply, no tax. No owner, no mint, nothing that can change.</span>
        </button>
        <button type="button" role="radio" aria-checked={kind === "tax"} className={`tc__kind ${kind === "tax" ? "is-on" : ""}`} onClick={() => setKind("tax")}>
          <b>Tax token</b>
          <span>Fixed supply with a buy tax and a sell tax of up to 10%, fixed forever.</span>
        </button>
      </div>

      <div className="tc__card">
        <div className="tc__notice">
          <b>CEXAID charges nothing to create a token.</b> You pay only the BNB network (gas) fee, straight from your wallet. The whole supply is minted to the wallet you deploy from.
        </div>

        <h3>Token details</h3>
        <div className="tc__row">
          <Field label="Token name" error={err_("name")}><input value={f.name} onChange={set("name")} placeholder="e.g. Alpha Coin" maxLength={64} /></Field>
          <Field label="Symbol" error={err_("symbol")}><input value={f.symbol} onChange={set("symbol")} placeholder="e.g. ALPHA" maxLength={16} /></Field>
        </div>
        <div className="tc__row">
          <Field label="Total supply" error={err_("supply")} hint={supplyWhole ? `${fmtWhole(supplyWhole)} tokens, all minted to you` : "Whole tokens, for example 1000000"}>
            <input value={f.supply} onChange={set("supply")} placeholder="1000000" inputMode="numeric" />
          </Field>
          <Field label="Decimals" error={err_("decimals")} hint="18 is the usual choice">
            <input value={f.decimals} onChange={set("decimals")} inputMode="numeric" />
          </Field>
        </div>

        {isTax && (
          <>
            <h3>Tax</h3>
            <div className="tc__row">
              <Field label="Buy tax (%)" error={err_("buyTax")} hint="0 to 10"><input value={f.buyTax} onChange={set("buyTax")} placeholder="3" inputMode="decimal" /></Field>
              <Field label="Sell tax (%)" error={err_("sellTax")} hint="0 to 10"><input value={f.sellTax} onChange={set("sellTax")} placeholder="3" inputMode="decimal" /></Field>
            </div>
            <Field label="Tax wallet" error={err_("taxWallet")} hint="Receives every tax payment, in your token. It can never be changed.">
              <input value={f.taxWallet} onChange={set("taxWallet")} placeholder="0x…" spellCheck={false} />
            </Field>

            <h3>Limits <small>(optional)</small></h3>
            <div className="tc__row">
              <Field label="Max transaction (% of supply)" error={err_("maxTx")} hint="Leave empty for no limit. Minimum 0.1."><input value={f.maxTx} onChange={set("maxTx")} placeholder="1" inputMode="decimal" /></Field>
              <Field label="Max wallet (% of supply)" error={err_("maxWallet")} hint="Leave empty for no limit. Minimum 0.1."><input value={f.maxWallet} onChange={set("maxWallet")} placeholder="2" inputMode="decimal" /></Field>
            </div>
            <p className="tc__small">Limits can later be loosened or removed by you, but never tightened. You and the tax wallet are exempt from tax and limits.</p>
          </>
        )}

        <div className="tc__summary">
          <h4>What you are creating</h4>
          <ul>
            <li>{f.name.trim() || "Your token"} ({f.symbol.trim() || "SYMBOL"}) on {ACTIVE_CHAIN.name}</li>
            <li>{supplyWhole ? fmtWhole(supplyWhole) : "—"} tokens, all sent to your wallet. Nobody can mint more.</li>
            {isTax ? (
              <>
                <li>Buy tax {f.buyTax || "—"}% and sell tax {f.sellTax || "—"}%, paid in the token to the tax wallet. Fixed forever.</li>
                <li>{f.maxTx || f.maxWallet ? `Limits: ${f.maxTx ? `max transaction ${f.maxTx}%` : "no max transaction"}, ${f.maxWallet ? `max wallet ${f.maxWallet}%` : "no max wallet"}.` : "No transaction or wallet limits."}</li>
                <li>No pause, no blacklist, no way to block selling.</li>
              </>
            ) : (
              <li>No tax, no owner, no pause, no blacklist. Nothing can change after launch.</li>
            )}
            <li>
              Network fee: {fee != null ? `about ${fee < 0.0001 ? "<0.0001" : fee.toFixed(4)} BNB` : isConnected ? "calculated once the form is complete" : "shown after you connect"}. CEXAID fee: 0.
            </li>
          </ul>
        </div>

        {err && <p className="tc__error" role="alert">{err}</p>}
        {msg && <p className="tc__msg">{msg}</p>}

        <div className="tc__actions">
          {isConnected ? (
            <button type="button" className="tc__btn" onClick={create} disabled={busy}>{busy ? "Working…" : `Create ${isTax ? "tax" : "standard"} token`}</button>
          ) : (
            <WalletConnectButton />
          )}
        </div>
        <p className="tc__small">
          Tokens made here are not reviewed, listed or endorsed by CEXAID. Check the details above before you confirm, because a deployed token cannot be edited. You are responsible for how you use your token and for following the rules where you operate. Crypto is risky and tokens can lose all value.
        </p>
      </div>

      <div className="tc__card tc__find">
        <h3>Already created a token here?</h3>
        <p className="tc__small">Paste its contract address to open the manage page (register your pair, loosen limits, renounce ownership).</p>
        <div className="tc__findrow">
          <input value={lookup} onChange={(e) => setLookup(e.target.value)} placeholder="0x… token address" spellCheck={false} />
          <button type="button" className="tc__btn tc__btn--ghost" onClick={goLookup} disabled={!isAddress(lookup.trim())}>Open</button>
        </div>
      </div>
      <Styles />
    </div>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <label className={`tc__field ${error ? "has-error" : ""}`}>
      <span>{label}</span>
      {children}
      {error ? <em className="tc__ferr">{error}</em> : hint ? <em className="tc__hint">{hint}</em> : null}
      <style jsx>{`
        .tc__field { display: flex; flex-direction: column; gap: 0.35rem; font-family: var(--lp-font-mono); font-size: 0.7rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--lp-mute); min-width: 0; }
        .tc__field :global(input) { background: var(--lp-panel-raised); border: 1px solid var(--lp-line); border-radius: 2px; color: var(--lp-ink); font-family: var(--lp-font-body); font-size: 0.92rem; padding: 0.6rem 0.7rem; text-transform: none; letter-spacing: 0; width: 100%; }
        .tc__field :global(input:focus) { outline: 2px solid var(--lp-brass); outline-offset: 1px; }
        .has-error :global(input) { border-color: var(--lp-signal-red); }
        .tc__hint, .tc__ferr { font-style: normal; text-transform: none; letter-spacing: 0; font-family: var(--lp-font-body); font-size: 0.74rem; line-height: 1.4; }
        .tc__hint { color: var(--lp-mute); }
        .tc__ferr { color: var(--lp-signal-red); }
      `}</style>
    </label>
  );
}

function Styles() {
  return (
    <style jsx global>{`
      .tc { display: flex; flex-direction: column; gap: 1.1rem; }
      .tc__kinds { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; }
      @media (max-width: 560px) { .tc__kinds { grid-template-columns: 1fr; } }
      .tc__kind { text-align: left; background: var(--lp-panel); border: 1px solid var(--lp-line); color: var(--lp-ink); padding: 1rem; border-radius: 2px; cursor: pointer; display: flex; flex-direction: column; gap: 0.35rem; font-family: var(--lp-font-body); }
      .tc__kind b { font-size: 1rem; }
      .tc__kind span { font-size: 0.8rem; color: var(--lp-mute); line-height: 1.45; }
      .tc__kind.is-on { border-color: var(--lp-brass); background: var(--lp-panel-raised); box-shadow: inset 0 0 0 1px var(--lp-brass); }
      .tc__card { background: var(--lp-panel); border: 1px solid var(--lp-line); padding: 1.4rem; display: flex; flex-direction: column; gap: 1rem; }
      .tc__card h2 { margin: 0; font-size: 1.4rem; }
      .tc__card h2 small { color: var(--lp-mute); font-weight: 500; font-size: 0.95rem; }
      .tc__card h3 { margin: 0.4rem 0 0; font-size: 1.02rem; color: var(--lp-brass-bright); }
      .tc__card h3 small { color: var(--lp-mute); font-weight: 400; }
      .tc__notice { background: var(--lp-panel-raised); border-left: 3px solid var(--lp-brass); padding: 0.8rem 1rem; font-size: 0.85rem; line-height: 1.55; color: var(--lp-ink); }
      .tc__row { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 0.9rem; }
      .tc__small { margin: 0; font-size: 0.78rem; line-height: 1.55; color: var(--lp-mute); }
      .tc__summary { background: var(--lp-panel-raised); border: 1px solid var(--lp-line); padding: 1rem 1.1rem; }
      .tc__summary h4 { margin: 0 0 0.5rem; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--lp-mute); font-family: var(--lp-font-mono); font-weight: 500; }
      .tc__summary ul { margin: 0; padding-left: 1.1rem; display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.86rem; line-height: 1.5; }
      .tc__error { margin: 0; color: var(--lp-signal-red); font-size: 0.86rem; }
      .tc__msg { margin: 0; color: var(--lp-brass-bright); font-size: 0.86rem; }
      .tc__actions { display: flex; gap: 0.7rem; flex-wrap: wrap; align-items: center; }
      .tc__btn { background: var(--lp-brass); color: var(--lp-on-accent); border: 1px solid var(--lp-brass); padding: 0.7rem 1.3rem; border-radius: 2px; font-family: var(--lp-font-body); font-weight: 600; font-size: 0.92rem; cursor: pointer; text-decoration: none; display: inline-block; }
      .tc__btn:disabled { opacity: 0.55; cursor: not-allowed; }
      .tc__btn--ghost { background: transparent; color: var(--lp-ink); border-color: var(--lp-line); }
      .tc__ok { border-color: var(--lp-signal-green); }
      .tc__eyebrow { font-family: var(--lp-font-mono); font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--lp-signal-green); }
      .tc__addr { display: flex; flex-direction: column; gap: 0.3rem; font-family: var(--lp-font-mono); font-size: 0.7rem; text-transform: uppercase; color: var(--lp-mute); letter-spacing: 0.06em; }
      .tc__addr code { font-size: 0.85rem; color: var(--lp-ink); word-break: break-all; text-transform: none; letter-spacing: 0; }
      .tc__links { display: flex; gap: 0.5rem 1.1rem; flex-wrap: wrap; font-size: 0.85rem; }
      .tc__links a, .tc__links button { color: var(--lp-brass-bright); background: none; border: 0; padding: 0; cursor: pointer; font: inherit; text-decoration: none; }
      .tc__verify { font-size: 0.85rem; line-height: 1.5; padding: 0.7rem 0.9rem; background: var(--lp-panel-raised); border: 1px solid var(--lp-line); }
      .tc__verify--verified { color: var(--lp-signal-green); border-color: var(--lp-signal-green); }
      .tc__verify--failed, .tc__verify--manual { color: var(--lp-mute); }
      .tc__steps { margin: 0; padding-left: 1.2rem; display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.88rem; line-height: 1.55; }
      .tc__steps a { color: var(--lp-brass-bright); }
      .tc__findrow { display: flex; gap: 0.6rem; }
      .tc__findrow input { flex: 1; min-width: 0; background: var(--lp-panel-raised); border: 1px solid var(--lp-line); border-radius: 2px; color: var(--lp-ink); padding: 0.6rem 0.7rem; font-family: var(--lp-font-body); font-size: 0.9rem; }
    `}</style>
  );
}
