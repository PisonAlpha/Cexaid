import "./globals.css";

export const metadata = {
  title: "CEXAID | Crypto Listings, Funding & Growth",
  description:
    "CEXAID helps crypto projects secure exchange listings, connect with VCs, grow communities, access funding, and explore acquisition opportunities.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}