"use client";

import { useState } from "react";
import { explorerAddressUrl } from "@/lib/launchpad/chain";

const row = { display: "grid", gridTemplateColumns: "150px 1fr", gap: "0.6rem", padding: "0.3rem 0", borderBottom: "1px solid var(--lp-line)", fontSize: "0.8rem", lineHeight: 1.5 };
const k = { color: "var(--lp-mute)", fontFamily: "var(--lp-font-mono)", fontSize: "0.72rem" };
const link = { color: "var(--lp-brass-bright)", wordBreak: "break-all" };
const fmtDate = (d) => (d ? new Date(d).toLocaleString() : "—");

// Admin-only. Everything the founder submitted, in one place, so a round can be
// reviewed before it is approved.
export function RoundReviewDetails({ round, kyc }) {
  const p = round.projects || {};
  const [check, setCheck] = useState(null);
  const [busy, setBusy] = useState(false);
  const steps = Array.isArray(round.vesting_schedule) ? round.vesting_schedule : [];
  const vestTotal = steps.reduce((s, x) => s + (Number(x.percent) || 0), 0);
  const tokensForSale = round.token_price_usd > 0 ? Number(round.total_allocation_usd) / Number(round.token_price_usd) : null;

  async function runCheck() {
    setBusy(true);
    setCheck(null);
    const res = await fetch(`/api/admin/token-check?address=${p.contract_address}`).then((r) => r.json()).catch(() => ({ ok: false, error: "Request failed." }));
    setCheck(res);
    setBusy(false);
  }

  const symbolMismatch = check?.ok && check.isContract && check.symbol && check.symbol.toUpperCase() !== String(round.token_symbol || "").toUpperCase();

  return (
    <details style={{ marginTop: "0.6rem", width: "100%" }}>
      <summary style={{ cursor: "pointer", color: "var(--lp-brass-bright)", fontSize: "0.82rem" }}>Review everything the founder submitted</summary>
      <div style={{ marginTop: "0.6rem", fontFamily: "var(--lp-font-body)" }}>
        <div style={row}><span style={k}>Project</span><span><b>{p.name}</b>{p.tagline ? ` — ${p.tagline}` : ""}</span></div>
        <div style={row}><span style={k}>Description</span><span style={{ whiteSpace: "pre-wrap" }}>{p.description || "—"}</span></div>
        <div style={row}>
          <span style={k}>Links</span>
          <span>
            {[["Website", p.website], ["Twitter", p.twitter], ["Telegram", p.telegram]].filter(([, u]) => u).map(([l, u]) => (
              <a key={l} href={u} target="_blank" rel="noopener noreferrer" style={{ ...link, marginRight: "0.9rem" }}>{l} ↗</a>
            ))}
            {!p.website && !p.twitter && !p.telegram && "None provided"}
          </span>
        </div>
        <div style={row}>
          <span style={k}>Founder KYC</span>
          <span>
            {kyc ? <>✓ {kyc.status} — {kyc.full_name}, {kyc.email}{kyc.business_name ? `, ${kyc.business_name}` : ""}</> : <span style={{ color: "var(--lp-signal-red)" }}>No KYC record found for this wallet</span>}
          </span>
        </div>
        <div style={row}>
          <span style={k}>Founder wallet</span>
          <a href={explorerAddressUrl(p.founder_wallet)} target="_blank" rel="noopener noreferrer" style={link}>{p.founder_wallet} ↗</a>
        </div>

        <div style={row}><span style={k}>Round</span><span>{round.token_symbol} @ ${round.token_price_usd} · allocation ${Number(round.total_allocation_usd).toLocaleString()}{tokensForSale ? ` (≈ ${Math.round(tokensForSale).toLocaleString()} ${round.token_symbol} for sale)` : ""} · ticket ${round.min_ticket_usd}–${round.max_ticket_usd}</span></div>
        <div style={row}><span style={k}>Dates</span><span>{fmtDate(round.starts_at)} → {fmtDate(round.ends_at)}</span></div>
        <div style={row}>
          <span style={k}>Token delivery</span>
          <span>
            {round.vest_tge_percent != null ? (
              <>
                Claim opens {fmtDate(round.tge_date)} · {round.vest_tge_percent}% at TGE · {round.vest_cliff_months}-month cliff · {round.vest_linear_months}-month linear
                {Number(round.vest_tge_percent) < 100 && Number(round.vest_linear_months) < 1 && <span style={{ display: "block", color: "var(--lp-signal-red)" }}>Warning: partial TGE unlock with no vesting period.</span>}
              </>
            ) : steps.length ? (
              <>
                {steps.slice(0, 6).map((s, i) => <span key={i} style={{ display: "block" }}>{s.label}: {s.percent}%</span>)}
                {vestTotal !== 100 && <span style={{ color: "var(--lp-signal-red)" }}>Warning: vesting adds up to {vestTotal}%, not 100%.</span>}
              </>
            ) : "None provided"}
          </span>
        </div>

        <div style={row}>
          <span style={k}>Token contract</span>
          <span>
            {p.contract_address ? (
              <>
                <a href={explorerAddressUrl(p.contract_address)} target="_blank" rel="noopener noreferrer" style={link}>{p.contract_address} ↗</a>
                <button type="button" onClick={runCheck} disabled={busy} style={{ marginLeft: "0.7rem", background: "var(--lp-panel-raised)", color: "var(--lp-ink)", border: "1px solid var(--lp-line)", borderRadius: 6, padding: "0.2rem 0.6rem", fontSize: "0.74rem", cursor: "pointer" }}>
                  {busy ? "Reading…" : "Check on-chain"}
                </button>
              </>
            ) : (
              <span style={{ color: "var(--lp-signal-red)" }}>Not provided. The founder must create the token first. Do not approve until it is provided.</span>
            )}
            {check && !check.ok && <span style={{ display: "block", color: "var(--lp-signal-red)" }}>{check.error}</span>}
            {check?.ok && !check.isContract && <span style={{ display: "block", color: "var(--lp-signal-red)" }}>No contract at this address on the current network.</span>}
            {check?.ok && check.isContract && (
              <span style={{ display: "block", marginTop: "0.3rem", color: "var(--lp-mute)" }}>
                On-chain: <b style={{ color: "var(--lp-ink)" }}>{check.name || "?"}</b> ({check.symbol || "?"}) · decimals {check.decimals ?? "?"} · total supply {check.totalSupply ? Number(check.totalSupply).toLocaleString() : "?"} · owner {check.owner || "none / not readable"}
                {symbolMismatch && <span style={{ display: "block", color: "var(--lp-signal-red)" }}>Symbol mismatch: founder entered {round.token_symbol}, contract says {check.symbol}.</span>}
              </span>
            )}
          </span>
        </div>
      </div>
    </details>
  );
}
