import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import StyledJsxRegistry from "@/components/site/StyledJsxRegistry";
import { SiteAnalytics } from "@/components/site/Analytics";

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--lp-font-body-raw",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--lp-font-mono-raw",
});

export const metadata = {
  metadataBase: new URL("https://www.cexaid.com"),
  title: "CEXAID | Crypto Listings, Funding & Growth",
  description:
    "CEXAID helps crypto projects secure exchange listings, connect with VCs, grow communities, access funding, and explore opportunities.",
  openGraph: {
    title: "CEXAID | Crypto Listings, Funding & Growth",
    description:
      "Markets, token unlocks and a private-sale launchpad for crypto projects.",
    url: "https://www.cexaid.com",
    siteName: "CEXAID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CEXAID | Crypto Listings, Funding & Growth",
    description:
      "Markets, token unlocks and a private-sale launchpad for crypto projects.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${body.variable} ${mono.variable}`}>
      <body>
        <StyledJsxRegistry>{children}</StyledJsxRegistry>
        <SiteAnalytics />
      </body>
    </html>
  );
}
