"use client";

import Link from "next/link";
import { useLaunchpad } from "@/lib/launchpad/LaunchpadContext";
import { InvestorAuthForm } from "@/components/launchpad/InvestorAuthForm";
import { InvestorApplicationForm } from "@/components/launchpad/InvestorApplicationForm";
import { InvestorStatus } from "@/components/launchpad/InvestorStatus";
import { WalletConnectButton } from "@/components/launchpad/WalletConnectButton";

export default function ApplyInvestorPage() {
  const { wallet, investorUser, investorSignOut, myApplication } = useLaunchpad();

  const status = wallet.isApprovedInvestor ? "approved" : myApplication?.status ?? "none";

  return (
    <main className="apply-page">
      <Link href="/launchpad" className="apply-page__back">
        ← Marketplace
      </Link>

      <div className="apply-page__head">
        <span className="apply-page__eyebrow">Platform-wide investor access</span>
        <h1>Sign up once. Access every Private Sale.</h1>
        <p>
          Approval is tied to your investor account, not just a wallet.
          You'll need both: an approved account (email + password) and a
          connected wallet to actually contribute.
        </p>
      </div>

      {investorUser === undefined && <p className="apply-page__loading">Loading…</p>}

      {investorUser === null && <InvestorAuthForm />}

      {investorUser && (
        <>
          <div className="apply-page__account">
            <span>Logged in as {investorUser.email}</span>
            <button onClick={investorSignOut}>Log out</button>
          </div>

          <InvestorStatus status={status} />
          {status !== "approved" && <InvestorApplicationForm />}

          {status === "approved" && (
            <div className="apply-page__wallet-step">
              <h4>Last step: connect your wallet</h4>
              <p>
                Your account is approved. Connect the wallet you'll
                contribute from — any wallet works, it doesn't need to be
                registered in advance.
              </p>
              <WalletConnectButton />
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .apply-page {
          max-width: 640px;
          margin: 0 auto;
          padding: 1.5rem 1.5rem 5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .apply-page__back {
          font-family: var(--lp-font-mono);
          font-size: 0.78rem;
          color: var(--lp-mute);
          text-decoration: none;
        }
        .apply-page__back:hover {
          color: var(--lp-brass);
        }
        .apply-page__head {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--lp-line);
        }
        .apply-page__eyebrow {
          font-family: var(--lp-font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--lp-mute);
        }
        .apply-page__head h1 {
          font-family: var(--lp-font-display);
          font-size: clamp(1.6rem, 4vw, 2.2rem);
          margin: 0;
          color: var(--lp-ink);
        }
        .apply-page__head p {
          font-family: var(--lp-font-body);
          color: var(--lp-mute);
          margin: 0;
        }
        .apply-page__loading {
          font-family: var(--lp-font-body);
          color: var(--lp-mute);
        }
        .apply-page__account {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: var(--lp-font-mono);
          font-size: 0.8rem;
          color: var(--lp-mute);
          background: var(--lp-panel);
          border: 1px solid var(--lp-line);
          padding: 0.7rem 1rem;
        }
        .apply-page__account button {
          background: transparent;
          border: 1px solid var(--lp-line);
          color: var(--lp-mute);
          font-family: var(--lp-font-mono);
          font-size: 0.75rem;
          padding: 0.3rem 0.7rem;
          border-radius: 2px;
          cursor: pointer;
        }
        .apply-page__wallet-step {
          background: var(--lp-panel);
          border: 1px solid var(--lp-signal-green);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .apply-page__wallet-step h4 {
          font-family: var(--lp-font-display);
          font-size: 1.1rem;
          margin: 0;
          color: var(--lp-ink);
        }
        .apply-page__wallet-step p {
          font-family: var(--lp-font-body);
          font-size: 0.85rem;
          color: var(--lp-mute);
          margin: 0;
        }
      `}</style>
    </main>
  );
}
