import Link from "next/link";
import { Twitter, Mail } from "lucide-react";
import { LogoMark } from "@/components/site/LogoMark";
import { CookieSettingsLink } from "@/components/site/Analytics";

const EMAIL = "contact@cexaid.com";
const GMAIL = `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL}&su=${encodeURIComponent("CEXAID enquiry")}`;

const SOCIALS = [
  { label: "X (Twitter)", href: "https://x.com/cexaidfunding", Icon: Twitter, external: true },
  { label: "Email", href: `mailto:${EMAIL}`, Icon: Mail, external: false },
];

const ICON_STYLE = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 40,
  height: 40,
  borderRadius: "50%",
  border: "1px solid rgba(55,114,255,0.35)",
  background: "rgba(55,114,255,0.1)",
  color: "var(--lp-brass-bright)",
};

export function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--lp-line)", marginTop: "3rem", padding: "2rem 1.25rem", textAlign: "center", color: "var(--lp-mute)", fontSize: "0.82rem" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", fontSize: "1.3rem", fontWeight: 800, color: "var(--lp-ink)" }}>
        <LogoMark size={30} />
        <span>CEX<span style={{ color: "var(--lp-brass)" }}>AID</span></span>
      </div>
      <p style={{ margin: "0.5rem 0 1rem" }}>Markets, token unlocks and a private-sale launchpad for crypto projects.</p>

      <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginBottom: "0.6rem" }}>
        {SOCIALS.map(({ label, href, Icon, external }) => (
          <a key={label} href={href} aria-label={label} title={label} style={ICON_STYLE} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            <Icon size={18} />
          </a>
        ))}
      </div>
      <p style={{ margin: "0 0 0.9rem" }}>
        <a
          href="https://iq.wiki/wiki/cexaid"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--lp-ink)", textDecoration: "none", border: "1px solid var(--lp-line)", borderRadius: 999, padding: "0.3rem 0.8rem 0.3rem 0.45rem" }}
        >
          <img src="/iqwiki.png" alt="" width={24} height={20} style={{ display: "block" }} />
          <span>CEXAID on IQ.wiki</span>
        </a>
      </p>
      <address style={{ margin: "0 0 0.9rem", fontStyle: "normal", lineHeight: 1.5 }}>
        CEXAID · Postgasse 8b · 1010 Vienna, Austria
      </address>
      <p style={{ margin: "0 0 1.2rem" }}>
        <a href={`mailto:${EMAIL}`} style={{ color: "var(--lp-brass-bright)" }}>{EMAIL}</a>
        <span aria-hidden="true"> · </span>
        <a href={GMAIL} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>Open in Gmail</a>
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", justifyContent: "center" }}>
        <Link href="/" style={{ color: "inherit" }}>Markets</Link>
        <Link href="/unlocks" style={{ color: "inherit" }}>Token Unlocks</Link>
        <Link href="/launchpad" style={{ color: "inherit" }}>Launchpad</Link>
        <Link href="/token" style={{ color: "inherit" }}>Token</Link>
        <Link href="/services" style={{ color: "inherit" }}>Services</Link>
        <Link href="/about" style={{ color: "inherit" }}>Team &amp; Contact</Link>
        <Link href="/terms" style={{ color: "inherit" }}>Terms</Link>
        <Link href="/privacy" style={{ color: "inherit" }}>Privacy</Link>
        <CookieSettingsLink />
      </div>
      <p style={{ margin: "1rem 0 0", fontSize: "0.72rem" }}>
        Market data by CoinGecko, CoinPaprika and DexScreener. Unlock data:{" "}
        <a href="https://pattern.plus" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>PatternPlus</a>.
        {" "}Not investment advice. © {new Date().getFullYear()} CEXAID
      </p>
    </footer>
  );
}
