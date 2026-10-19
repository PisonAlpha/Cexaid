import Link from "next/link";
import { TokenCreator } from "@/components/launchpad/TokenCreator";

export const metadata = {
  title: "Create a token | CEXAID",
  description: "Create a standard or tax token on BNB Chain in a minute. CEXAID charges nothing. You only pay the network fee.",
};

export default function CreateTokenPage() {
  return (
    <main className="ct-page">
      <Link href="/launchpad" className="ct-page__back">← Marketplace</Link>
      <div className="ct-page__head">
        <span className="ct-page__eyebrow">Token creator</span>
        <h1>Create your token on BNB Chain</h1>
        <p>
          Fill in the details and deploy from your own wallet. Choose a standard token with no tax, or a tax token with
          a fixed buy and sell tax. CEXAID charges nothing: you only pay the network fee in BNB.
        </p>
      </div>
      <TokenCreator />
      <style>{`
        .ct-page { max-width: 760px; margin: 0 auto; padding: 1.5rem 1.5rem 5rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .ct-page__back { font-family: var(--lp-font-mono); font-size: 0.78rem; color: var(--lp-mute); text-decoration: none; }
        .ct-page__back:hover { color: var(--lp-brass); }
        .ct-page__head { display: flex; flex-direction: column; gap: 0.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--lp-line); }
        .ct-page__eyebrow { font-family: var(--lp-font-mono); font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--lp-mute); }
        .ct-page__head h1 { font-family: var(--lp-font-display); font-size: clamp(1.6rem, 4vw, 2.2rem); margin: 0; color: var(--lp-ink); }
        .ct-page__head p { font-family: var(--lp-font-body); color: var(--lp-mute); margin: 0; line-height: 1.55; }
      `}</style>
    </main>
  );
}
