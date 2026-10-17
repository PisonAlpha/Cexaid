// ─────────────────────────────────────────────────────────────────────────────
// CEXAID TOKEN content. Edit this file to change anything on /token.
//
// Vesting is structured: tge = % of that category unlocked at launch (TGE),
// cliff = months with no further unlocks after TGE, linear = months over which
// the remainder unlocks evenly after the cliff. The page derives the text and
// the circulating-supply schedule from these numbers, so change them here only.
// Allocation percentages must add up to 100, and the TGE unlocks must add up
// to initialCirculatingPercent (the page flags a mismatch).
// ─────────────────────────────────────────────────────────────────────────────

export const TOKEN = {
  name: "CEXAID Token",
  ticker: "CXD",
  tagline: "The utility token of the CEXAID ecosystem.",

  about: [
    "CEXAID is building a crypto markets terminal and a KYC-verified private-sale launchpad. The CEXAID Token is planned as the ecosystem's utility token.",
    "CXD has a fixed total supply of 450,000,000 tokens, 9% of which is circulating at launch. There is no community airdrop and no public sale: tokens are distributed only through the categories below, each on a published vesting schedule.",
    "The CXD token contract is deployed on BNB Chain with its full fixed supply held by the CEXAID treasury wallet. No public sale or airdrop is open. Vesting contracts, liquidity and utility are rolled out in phases (see the roadmap). The figures on this page are the v1.0 plan described in the whitepaper; nothing here is an offer to sell tokens, and details may change. Any change will be published here and in an updated whitepaper.",
  ],

  // Planned utility. Keep this to what the team actually intends to build.
  utility: [
    { title: "Allocation tiers", desc: "Planned: holders gain access to higher allocation tiers in launchpad rounds. Investor approval and KYC still apply to everyone." },
    { title: "Fee discounts", desc: "Planned: reduced platform fees for holders." },
    { title: "Staking", desc: "Planned: stake to unlock tiers and platform benefits." },
    { title: "Governance (under review)", desc: "Whether and how holders can vote on platform decisions is still being decided." },
  ],

  tokenomics: {
    totalSupply: 450000000, // confirmed
    chain: "BNB Chain (BEP20)",
    contract: "0xe7b641E7F0E03eDf7fa572966FD810a5A6578B71", // CexaidToken, deployed on BNB mainnet
    holder: "0x88C11A96802DaEC28A5ea166572C7a79c4222c48", // CEXAID treasury wallet, received the full supply at deployment
    initialCirculatingPercent: 9, // confirmed: 9% of total supply at launch
    // Categories are confirmed. Fill in `percent` (and optionally `vesting`)
    // when final - until then they show "TBA". Percentages must add up to 100.
    allocation: [
      { label: "Private Sale", percent: 10, vest: { tge: 10, cliff: 3, linear: 18 }, note: "KYC-verified investors." },
      { label: "Angel Round", percent: 5, vest: { tge: 10, cliff: 3, linear: 15 }, note: "Early backers." },
      { label: "Team", percent: 15, vest: { tge: 0, cliff: 12, linear: 36 }, note: "12-month cliff, then 36 months linear." },
      { label: "Treasury", percent: 14, vest: { tge: 0, cliff: 6, linear: 48 }, note: "Platform development and reserves." },
      { label: "Partners & Advisory", percent: 6, vest: { tge: 0, cliff: 6, linear: 24 }, note: "Strategic partners and advisors." },
      { label: "Liquidity", percent: 10, vest: { tge: 50, cliff: 0, linear: 6 }, note: "Market liquidity and exchange listings." },
      { label: "Ecosystem", percent: 25, vest: { tge: 4, cliff: 0, linear: 48 }, note: "Grants, staking rewards and incentives." },
      { label: "Marketing", percent: 15, vest: { tge: 10, cliff: 1, linear: 30 }, note: "Growth, campaigns and listings." },
    ],
    // Confirmed: these do NOT exist for CXD.
    notIncluded: ["Community airdrop", "Public sale"],
  },

  roadmap: [
    { phase: "Phase 1", title: "Foundation", status: "live", items: ["Private-sale launchpad with founder KYC and investor approval", "Per-round sale contracts with contract-based refunds", "Markets terminal, trending and new-pair feeds", "Token unlock calendar"] },
    { phase: "Phase 2", title: "Token design & legal review", status: "in-progress", items: ["Supply, allocation and vesting published (v1.0)", "Whitepaper and pitch deck published", "Independent legal review"] },
    { phase: "Phase 3", title: "Token contract & vesting", status: "in-progress", items: ["CXD token contract deployed on BNB Chain (fixed supply, no mint function, no owner)", "Vesting contracts for the locked allocations", "Independent smart-contract audit"] },
    { phase: "Phase 4", title: "Distribution & liquidity", status: "planned", items: ["Distribution according to the published vesting schedules, subject to legal review", "Liquidity and listings"] },
    { phase: "Phase 5", title: "Utility rollout", status: "planned", items: ["Staking and allocation tiers", "Fee discounts", "Ecosystem expansion"] },
  ],
  roadmapNote: "Phases are sequential and gated on audit and legal review. Dates are announced once each phase is confirmed.",

  documents: [
    { label: "Whitepaper", desc: "Vision, product, token design, vesting and risks (v1.0).", url: "/docs/CEXAID-Whitepaper.pdf" },
    { label: "Pitch Deck", desc: "Overview of the CEXAID opportunity (PDF).", url: "/docs/CEXAID-Pitch-Deck.pdf" },
    { label: "Pitch Deck (PowerPoint)", desc: "Editable version of the deck.", url: "/docs/CEXAID-Pitch-Deck.pptx" },
  ],
};
