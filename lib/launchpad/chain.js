import { bsc, bscTestnet } from "viem/chains";

// 56 = BNB Smart Chain mainnet (default), 97 = BSC testnet.
// Set NEXT_PUBLIC_CHAIN_ID=97 to run the whole site against testnet.
export const ACTIVE_CHAIN = Number(process.env.NEXT_PUBLIC_CHAIN_ID) === 97 ? bscTestnet : bsc;

export const SALE_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_SALE_FACTORY_ADDRESS || "";

export const explorerAddressUrl = (address) =>
  `${ACTIVE_CHAIN.id === 97 ? "https://testnet.bscscan.com" : "https://bscscan.com"}/address/${address}`;
export const explorerTxUrl = (hash) =>
  `${ACTIVE_CHAIN.id === 97 ? "https://testnet.bscscan.com" : "https://bscscan.com"}/tx/${hash}`;
