// ─────────────────────────────────────────────────────────────────────────────
// CEXAID TOKEN — EDIT THIS FILE to publish real details.
// Anything left as null / empty shows as "To be announced" on the site, so
// nothing here is invented. Only add figures that are final and approved.
//
// To publish a document: put the PDF in  public/docs/  (e.g. whitepaper.pdf)
// and set its url below to "/docs/whitepaper.pdf". Links to other sites
// (https://…) work too. With url: null the button shows "Coming soon".
// ─────────────────────────────────────────────────────────────────────────────

export const TOKEN = {
  name: "CEXAID Token",
  ticker: null, // e.g. "CXD" once decided
  status: "In development — not yet launched. No token sale is open.",
  tagline: "The planned utility token of the CEXAID ecosystem.",

  about: [
    "CEXAID is building a crypto markets terminal and a KYC-verified private-sale launchpad. The CEXAID Token is planned as the ecosystem's utility token.",
    "Full details — final name, ticker, supply and chain — will be published here and in the whitepaper before any distribution.",
  ],

  // Planned utility. Keep this to what the team actually intends to build.
  utility: [
    { title: "Allocation tiers", desc: "Planned: holders gain access to higher allocation tiers in launchpad rounds. Investor approval and KYC still apply to everyone." },
    { title: "Fee discounts", desc: "Planned: reduced platform fees for holders." },
    { title: "Staking", desc: "Planned: stake to unlock tiers and platform benefits." },
    { title: "Governance (under review)", desc: "Whether and how holders can vote on platform decisions is still being decided." },
  ],

  tokenomics: {
    totalSupply: null, // e.g. 1000000000
    chain: null, // e.g. "BNB Chain"
    initialCirculating: null,
    // Add rows when final: { label: "Community & Ecosystem", percent: 30 }
    // Percentages should add up to 100.
    allocation: [],
  },

  roadmap: [
    { phase: "Phase 1", title: "Foundation", status: "live", items: ["Private-sale launchpad with founder KYC and investor approval", "Markets terminal, trending and new-pair feeds", "Token unlock calendar"] },
    { phase: "Phase 2", title: "Token design & legal review", status: "planned", items: ["Finalise supply, allocation and utility", "Independent legal review", "Publish whitepaper"] },
    { phase: "Phase 3", title: "Testnet & audit", status: "planned", items: ["Escrow and token contracts on testnet", "Independent smart-contract audit", "Public testnet"] },
    { phase: "Phase 4", title: "Token launch", status: "planned", items: ["Token generation event, subject to legal review and audit", "Liquidity and listings"] },
    { phase: "Phase 5", title: "Utility rollout", status: "planned", items: ["Staking and allocation tiers", "Fee discounts", "Ecosystem expansion"] },
  ],
  roadmapNote: "Draft roadmap — dates will be announced as each phase is confirmed.",

  documents: [
    { label: "Whitepaper", desc: "Vision, design and technical detail.", url: null },
    { label: "Pitch Deck", desc: "Overview of the CEXAID opportunity.", url: null },
    { label: "Litepaper", desc: "A short summary of the token.", url: null },
  ],
};
