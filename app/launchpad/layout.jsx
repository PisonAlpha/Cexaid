"use client";

import { useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/launchpad/wagmiConfig";
import { LaunchpadProvider } from "@/lib/launchpad/LaunchpadContext";
import { SiteHeader } from "@/components/site/SiteHeader";

export default function LaunchpadLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <LaunchpadProvider>
          <SiteHeader />
          {children}
        </LaunchpadProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
