"use client";

import { useAccount, useReadContracts } from "wagmi";
import { SALE_ROUND_ABI, ERC20_ABI } from "./saleAbi";
import { ACTIVE_CHAIN } from "./chain";

const ROUND_FIELDS = [
  "raised", "hardCap", "paused", "refundsOpen", "finalized", "refundDeadline", "isFunded",
  "tokensDeposited", "tokensForHardCap", "tokensOwed", "totalTokensSold", "totalTokensClaimed",
  "token", "founder", "treasury", "priceUsdt", "tokenDecimals", "tgeTime", "tgeBps",
  "cliffSeconds", "vestingSeconds", "startTime", "endTime", "unlockedBps",
];

// Reads everything the sale page needs straight from the round contract (and its token),
// plus the connected wallet's own position. Refreshes every 15s.
export function useRoundChain(roundAddress) {
  const { address } = useAccount();
  const base = { address: roundAddress, abi: SALE_ROUND_ABI, chainId: ACTIVE_CHAIN.id };

  const main = useReadContracts({
    contracts: roundAddress ? ROUND_FIELDS.map((functionName) => ({ ...base, functionName })) : [],
    query: { enabled: !!roundAddress, refetchInterval: 15000 },
  });
  const v = {};
  ROUND_FIELDS.forEach((f, i) => { v[f] = main.data?.[i]?.status === "success" ? main.data[i].result : undefined; });

  const tokenBase = { address: v.token, abi: ERC20_ABI, chainId: ACTIVE_CHAIN.id };
  const tok = useReadContracts({
    contracts: v.token
      ? [
          { ...tokenBase, functionName: "symbol" },
          { ...tokenBase, functionName: "name" },
          { ...tokenBase, functionName: "balanceOf", args: [roundAddress] },
          ...(address ? [{ ...tokenBase, functionName: "balanceOf", args: [address] }] : []),
        ]
      : [],
    query: { enabled: !!v.token, refetchInterval: 15000 },
  });
  const r = (i) => (tok.data?.[i]?.status === "success" ? tok.data[i].result : undefined);

  const me = useReadContracts({
    contracts: address && roundAddress
      ? ["contributed", "tokensOf", "claimedTokens", "claimable", "vestedOf", "refunded"].map((functionName) => ({ ...base, functionName, args: [address] }))
      : [],
    query: { enabled: !!address && !!roundAddress, refetchInterval: 15000 },
  });
  const m = (i) => (me.data?.[i]?.status === "success" ? me.data[i].result : undefined);

  const refetch = () => { main.refetch(); tok.refetch(); me.refetch(); };

  return {
    loaded: !!main.data && v.token !== undefined,
    ...v,
    symbol: r(0),
    tokenName: r(1),
    contractTokenBalance: r(2),
    myTokenBalance: address ? r(3) : undefined,
    wallet: address,
    mine: address
      ? { contributed: m(0) ?? 0n, tokensOf: m(1) ?? 0n, claimed: m(2) ?? 0n, claimable: m(3) ?? 0n, vested: m(4) ?? 0n, refunded: m(5) === true }
      : null,
    refetch,
  };
}
