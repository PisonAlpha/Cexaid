// USDT on BNB Smart Chain (BEP20). Double check against BscScan before going live.
export const USDT_TOKEN_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
export const USDT_DECIMALS = 18; // BEP20 USDT uses 18 decimals (Ethereum USDT uses 6)

// Where round contributions are sent.
export const CONTRIBUTION_PAYMENT_WALLET = "0x068740b68ebedb6a8d1ec38390f0567bc06770bf";

export const ERC20_TRANSFER_ABI = [
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];
