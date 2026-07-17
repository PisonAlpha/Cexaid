import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--lp-font-display-raw",
});
const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--lp-font-body-raw",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--lp-font-mono-raw",
});

export const metadata = {
  title: "CEXAID | Crypto Listings, Funding & Growth",
  description:
    "CEXAID helps crypto projects secure exchange listings, connect with VCs, grow communities, access funding, and explore opportunities.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
