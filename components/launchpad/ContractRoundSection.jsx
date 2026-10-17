"use client";

import { useRoundChain } from "@/lib/launchpad/useRoundChain";
import { SaleTrustPanel } from "./SaleTrustPanel";
import { FounderTokenPanel } from "./FounderTokenPanel";
import { InvestorClaimPanel } from "./InvestorClaimPanel";
import { RefundClaim } from "./RefundClaim";
import { VestingTimeline } from "./VestingTimeline";
import { Collapsible } from "./Collapsible";

// Everything specific to a round that runs on its own contract.
export function ContractRoundSection({ round }) {
  const chain = useRoundChain(round.contractAddress);
  return (
    <>
      <SaleTrustPanel round={round} chain={chain} />
      <FounderTokenPanel roundAddress={round.contractAddress} chain={chain} />
      <RefundClaim round={round} />
      <InvestorClaimPanel roundAddress={round.contractAddress} chain={chain} />
      {chain.loaded && (
        <Collapsible title="Token unlock schedule" subtitle="Enforced on-chain. Claim directly from the contract." defaultOpen>
          <VestingTimeline
            tgeTime={chain.tgeTime}
            tgeBps={chain.tgeBps}
            cliffSeconds={chain.cliffSeconds}
            vestingSeconds={chain.vestingSeconds}
            symbol={chain.symbol}
          />
        </Collapsible>
      )}
    </>
  );
}
