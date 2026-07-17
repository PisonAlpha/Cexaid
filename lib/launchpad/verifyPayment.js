import { createPublicClient, http, parseUnits, decodeEventLog } from "viem";
import { bsc } from "viem/chains";
import { USDT_TOKEN_ADDRESS, USDT_DECIMALS } from "./contracts";

// Server-only. Reads the ACTUAL transaction from BSC's public chain data -
// this is what makes a payment "real" instead of "the browser said it
// happened." Never trust a txHash without checking it landed on-chain,
// went to the right address, and moved the right amount.

const publicClient = createPublicClient({
  chain: bsc,
  transport: http(),
});

const TRANSFER_EVENT = {
  type: "event",
  name: "Transfer",
  inputs: [
    { indexed: true, name: "from", type: "address" },
    { indexed: true, name: "to", type: "address" },
    { indexed: false, name: "value", type: "uint256" },
  ],
};

export async function verifyUsdtTransfer({ txHash, expectedTo, expectedAmountUSD }) {
  let receipt;
  try {
    receipt = await publicClient.getTransactionReceipt({ hash: txHash });
  } catch (err) {
    return {
      ok: false,
      error:
        "Couldn't find that transaction on-chain yet. It may still be confirming - wait a few seconds and try again.",
    };
  }

  if (receipt.status !== "success") {
    return { ok: false, error: "That transaction failed on-chain." };
  }

  const expectedWei = parseUnits(String(expectedAmountUSD), USDT_DECIMALS);

  const matches = receipt.logs.some((log) => {
    if (log.address.toLowerCase() !== USDT_TOKEN_ADDRESS.toLowerCase()) return false;
    try {
      const decoded = decodeEventLog({
        abi: [TRANSFER_EVENT],
        data: log.data,
        topics: log.topics,
      });
      return (
        decoded.args.to.toLowerCase() === expectedTo.toLowerCase() &&
        decoded.args.value >= expectedWei
      );
    } catch {
      return false;
    }
  });

  if (!matches) {
    return {
      ok: false,
      error: "That transaction didn't transfer the expected USDT amount to the expected address.",
    };
  }

  return { ok: true };
}
