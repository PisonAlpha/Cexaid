// PancakeSwap V2 lookups used only as a convenience on the manage page ("Find my pair").
// The token contract itself checks that a pair really holds the token, so a wrong address here cannot cause harm.
import { ACTIVE_CHAIN } from "@/lib/launchpad/chain";

const MAINNET = {
  factory: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
  wbnb: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  usdt: "0x55d398326f99059fF775485246999027B3197955",
};
const TESTNET = {
  factory: "0x6725F303b657a9451d8BA641348b6761A6CC7a17",
  wbnb: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
  usdt: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
};

export const DEX = ACTIVE_CHAIN.id === 97 ? TESTNET : MAINNET;

export const FACTORY_ABI = [
  { type: "function", name: "getPair", stateMutability: "view", inputs: [{ name: "a", type: "address" }, { name: "b", type: "address" }], outputs: [{ type: "address" }] },
];

export const pancakeAddLiquidityUrl = (token) =>
  `https://pancakeswap.finance/v2/add/BNB/${token}?chain=${ACTIVE_CHAIN.id === 97 ? "bscTestnet" : "bsc"}`;
