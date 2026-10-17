"use client";

import { explorerAddressUrl } from "@/lib/launchpad/chain";

// Admin view only: shows where a round's contract stands. The FOUNDER deploys the
// contract from the sale page; the admin approves the listing and watches the status.
export function RoundContractStatus({ round }) {
  if (round.contract_address) {
    return (
      <a href={explorerAddressUrl(round.contract_address)} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.78rem", color: "var(--lp-signal-green)" }}>
        ✓ Contract {round.contract_address.slice(0, 8)}…{round.contract_address.slice(-6)} ↗
      </a>
    );
  }
  if (new Date(round.ends_at) < new Date()) return <span style={{ fontSize: "0.78rem", color: "var(--lp-mute)" }}>Concluded (no contract)</span>;
  return (
    <span style={{ fontSize: "0.78rem", color: "var(--lp-mute)", maxWidth: 260, textAlign: "right" }}>
      Approved · waiting for the founder to deploy the sale contract (20 USDT fee paid by the founder)
    </span>
  );
}
