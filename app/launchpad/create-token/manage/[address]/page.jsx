import Link from "next/link";
import { TokenManager } from "@/components/launchpad/TokenManager";

export const metadata = { title: "Manage token | CEXAID" };

export default async function ManageTokenPage({ params }) {
  const { address } = await params;
  return (
    <main className="mt-page">
      <Link href="/launchpad/create-token" className="mt-page__back">← Token creator</Link>
      <h1>Token page</h1>
      <TokenManager address={address} />
      <style>{`
        .mt-page { max-width: 760px; margin: 0 auto; padding: 1.5rem 1.5rem 5rem; display: flex; flex-direction: column; gap: 1.2rem; }
        .mt-page__back { font-family: var(--lp-font-mono); font-size: 0.78rem; color: var(--lp-mute); text-decoration: none; }
        .mt-page__back:hover { color: var(--lp-brass); }
        .mt-page h1 { font-family: var(--lp-font-display); font-size: clamp(1.5rem, 4vw, 2rem); margin: 0; color: var(--lp-ink); }
      `}</style>
    </main>
  );
}
