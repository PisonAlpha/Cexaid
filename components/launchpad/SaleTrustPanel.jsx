"use client";

import { explorerAddressUrl } from "@/lib/launchpad/chain";
import { fmtUnits } from "@/lib/launchpad/units";

const short = (a) => (a ? `${a.slice(0, 8)}…${a.slice(-6)}` : "—");
const fmtDate = (s) => new Date(Number(s) * 1000).toLocaleString();

function statusOf(c) {
  const now = Date.now() / 1000;
  if (c.refundsOpen) return { tone: "warn", title: "Refunds open", text: "This round is being refunded. Contributors claim their USDT back from the contract." };
  if (!c.isFunded) return { tone: "warn", title: "Awaiting token deposit", text: "The sale opens after the founder deposits the full amount of tokens into the contract. Contributions are blocked until then." };
  if (c.paused) return { tone: "warn", title: "Temporarily paused", text: "Contributions are paused by CEXAID. Claims are not affected." };
  if (now < Number(c.startTime)) return { tone: "info", title: "Funded · opens soon", text: `The sale opens ${fmtDate(c.startTime)}.` };
  if (now <= Number(c.endTime)) return { tone: "live", title: "Sale live", text: `Open until ${fmtDate(c.endTime)}.` };
  if (now < Number(c.tgeTime)) return { tone: "info", title: "Sale ended", text: `Token claiming opens ${fmtDate(c.tgeTime)}.` };
  return { tone: "live", title: "Claiming open", text: "Investors can claim their unlocked tokens from the contract." };
}

// Everything an investor needs to trust a round, read from the chain.
export function SaleTrustPanel({ round, chain }) {
  const c = chain;
  const addr = round.contractAddress;
  if (!c.loaded) return <div className="st"><p className="st__muted">Reading the sale contract…</p><style jsx>{`.st{padding:1rem;border:1px solid var(--lp-line);background:var(--lp-panel)}.st__muted{margin:0;color:var(--lp-mute);font-size:.85rem}`}</style></div>;

  const dec = Number(c.tokenDecimals ?? 18);
  const sym = c.symbol || round.tokenSymbol;
  const required = c.tokensForHardCap ?? 0n;
  const deposited = c.tokensDeposited ?? 0n;
  const pct = required > 0n ? Math.min(100, Number((deposited * 10000n) / required) / 100) : 0;
  const st = statusOf(c);
  const tokensPerUsd = c.priceUsdt && c.priceUsdt > 0n ? Number((10n ** 18n * 10000n) / c.priceUsdt) / 10000 : null;

  const checks = [
    { ok: c.isFunded, title: c.isFunded ? "Tokens are locked in the contract" : "Tokens not deposited yet", text: `${fmtUnits(deposited, dec, 2)} of ${fmtUnits(required, dec, 2)} ${sym} needed for the hard cap.` },
    { ok: true, title: "Vesting is enforced by the contract", text: "Investors claim on a fixed schedule. It cannot be changed after deployment." },
    { ok: true, title: "CEXAID cannot take investor tokens", text: "The contract has no function for CEXAID to withdraw tokens owed to investors. The founder can only take back unsold surplus after the sale." },
    { ok: true, title: "Refunds are contract-based", text: "If a round is refunded, USDT is returned to the contract first and each investor claims their own contribution." },
    { ok: true, title: "Founder and investors are verified", text: "The founder passed CEXAID KYC. Only approved investors receive a contribution voucher." },
  ];

  return (
    <div className="st">
      <div className={`st__banner st__banner--${st.tone}`}>
        <b>{st.title}</b>
        <span>{st.text}</span>
      </div>

      <div className="st__escrow">
        <div className="st__escrow-head">
          <span>Token escrow</span>
          <b>{fmtUnits(deposited, dec, 2)} / {fmtUnits(required, dec, 2)} {sym}</b>
        </div>
        <div className="st__bar"><i style={{ width: `${pct}%` }} /></div>
      </div>

      <div className="st__facts">
        <div><span>Price</span><b>${round.tokenPriceUSD} per {sym}</b></div>
        <div><span>You receive</span><b>{tokensPerUsd ? `${tokensPerUsd.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${sym} per $1` : "—"}</b></div>
        <div><span>Sold so far</span><b>{fmtUnits(c.totalTokensSold ?? 0n, dec, 2)} {sym}</b></div>
        <div><span>Claiming opens</span><b>{fmtDate(c.tgeTime)}</b></div>
      </div>

      <div className="st__checks">
        {checks.map((k) => (
          <div key={k.title} className="st__check">
            <span className={`st__icon st__icon--${k.ok === null ? "na" : k.ok ? "ok" : "no"}`}>{k.ok === null ? "!" : k.ok ? "✓" : "✕"}</span>
            <div><b>{k.title}</b><p>{k.text}</p></div>
          </div>
        ))}
      </div>

      <div className="st__links">
        <a href={explorerAddressUrl(addr)} target="_blank" rel="noopener noreferrer">Sale contract {short(addr)} ↗</a>
        <a href={explorerAddressUrl(c.token)} target="_blank" rel="noopener noreferrer">{sym} token {short(c.token)} ↗</a>
      </div>

      <style jsx>{`
        .st { font-family: var(--lp-font-body); background: var(--lp-panel); border: 1px solid var(--lp-line); border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; gap: 1.1rem; }
        .st__banner { display: flex; flex-direction: column; gap: 0.2rem; padding: 0.8rem 1rem; border-radius: 8px; border: 1px solid var(--lp-line); font-size: 0.85rem; color: var(--lp-mute); }
        .st__banner b { color: var(--lp-ink); font-size: 0.98rem; }
        .st__banner--live { border-color: rgba(22,199,132,0.5); background: rgba(22,199,132,0.07); }
        .st__banner--warn { border-color: rgba(245,196,81,0.5); background: rgba(245,196,81,0.07); }
        .st__banner--info { border-color: rgba(55,114,255,0.5); background: rgba(55,114,255,0.07); }
        .st__escrow-head { display: flex; justify-content: space-between; font-size: 0.82rem; color: var(--lp-mute); margin-bottom: 0.4rem; }
        .st__escrow-head b { color: var(--lp-ink); }
        .st__bar { height: 8px; border-radius: 4px; background: var(--lp-line); overflow: hidden; }
        .st__bar i { display: block; height: 100%; background: var(--lp-signal-green); }
        .st__facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 0.6rem; }
        .st__facts div { background: var(--lp-panel-raised); border: 1px solid var(--lp-line); border-radius: 8px; padding: 0.6rem 0.75rem; display: flex; flex-direction: column; gap: 0.2rem; }
        .st__facts span { color: var(--lp-mute); font-size: 0.72rem; }
        .st__facts b { color: var(--lp-ink); font-size: 0.9rem; }
        .st__checks { display: flex; flex-direction: column; gap: 0.7rem; }
        .st__check { display: grid; grid-template-columns: 22px 1fr; gap: 0.7rem; align-items: start; }
        .st__check b { color: var(--lp-ink); font-size: 0.88rem; }
        .st__check p { margin: 0.1rem 0 0; color: var(--lp-mute); font-size: 0.8rem; line-height: 1.55; }
        .st__icon { width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; margin-top: 2px; }
        .st__icon--ok { background: rgba(22,199,132,0.18); color: var(--lp-signal-green); }
        .st__icon--no { background: rgba(234,57,67,0.18); color: var(--lp-signal-red); }
        .st__icon--na { background: rgba(245,196,81,0.18); color: #f5c451; }
        .st__links { display: flex; flex-wrap: wrap; gap: 0.5rem 1.2rem; }
        .st__links a { color: var(--lp-brass-bright); font-size: 0.8rem; text-decoration: none; }
        .st__links a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
