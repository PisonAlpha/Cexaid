import { http, createConfig } from "wagmi";
import { ACTIVE_CHAIN } from "./chain";
import { injected, walletConnect } from "wagmi/connectors";

// Get a free Project ID at https://dashboard.reown.com and put it in
// .env.local as NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id_here
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export const wagmiConfig = createConfig({
  chains: [ACTIVE_CHAIN],
  connectors: [
    injected(),
    ...(projectId
      ? [
          walletConnect({
            projectId,
            showQrModal: true,
            metadata: {
              name: "CEXAID Launchpad",
              description: "CEXAID Private Sale",
              url: "https://cexaid.com",
              icons: ["https://cexaid.com/icon.png"],
            },
          }),
        ]
      : []),
  ],
  transports: {
    [ACTIVE_CHAIN.id]: http(),
  },
  ssr: true,
});
