"use client";

import { useState } from "react";
import Link from "next/link";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/launchpad/wagmiConfig";
import { LaunchpadProvider } from "@/lib/launchpad/LaunchpadContext";

export default function LaunchpadLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <LaunchpadProvider>
          <div className="lp-topbar">
            <Link href="/" className="lp-topbar__link">
              ← CEXAID Home
            </Link>
          </div>
          {children}

          <style jsx>{`
            .lp-topbar {
              max-width: 1080px;
              margin: 0 auto;
              padding: 1rem 1.5rem 0;
            }
            .lp-topbar__link {
              font-family: var(--lp-font-mono);
              font-size: 0.75rem;
              color: var(--lp-mute);
              text-decoration: none;
            }
            .lp-topbar__link:hover {
              color: var(--lp-brass);
            }
          `}</style>
        </LaunchpadProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
