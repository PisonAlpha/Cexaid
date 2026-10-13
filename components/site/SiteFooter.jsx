import Link from "next/link";

export function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--lp-line)", marginTop: "3rem", padding: "2rem 1.25rem", textAlign: "center", color: "var(--lp-mute)", fontSize: "0.82rem" }}>
      <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--lp-ink)" }}>
        CEX<span style={{ color: "var(--lp-brass)" }}>AID</span>
      </div>
      <p style={{ margin: "0.5rem 0 1rem" }}>Markets, token unlocks and a private-sale launchpad for crypto projects.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", justifyContent: "center" }}>
        <Link href="/" style={{ color: "inherit" }}>Markets</Link>
        <Link href="/unlocks" style={{ color: "inherit" }}>Token Unlocks</Link>
        <Link href="/launchpad" style={{ color: "inherit" }}>Launchpad</Link>
        <Link href="/token" style={{ color: "inherit" }}>Token</Link>
        <Link href="/services" style={{ color: "inherit" }}>Services</Link>
        <Link href="/about" style={{ color: "inherit" }}>Team &amp; Contact</Link>
        <Link href="/terms" style={{ color: "inherit" }}>Terms</Link>
        <Link href="/privacy" style={{ color: "inherit" }}>Privacy</Link>
      </div>
      <p style={{ margin: "1rem 0 0", fontSize: "0.72rem" }}>
        Market data by CoinGecko, CoinPaprika and DexScreener. Not investment advice. © {new Date().getFullYear()} CEXAID
      </p>
    </footer>
  );
}
