"use client";

import Link from "next/link";
import { useLaunchpad } from "@/lib/launchpad/LaunchpadContext";
import { KycForm } from "@/components/launchpad/KycForm";
import { KycStatus } from "@/components/launchpad/KycStatus";

export default function KycPage() {
  const { kycStatus, kycRejectionReason } = useLaunchpad();

  return (
    <main className="kyc-page">
      <Link href="/launchpad" className="kyc-page__back">
        ← Marketplace
      </Link>

      <div className="kyc-page__head">
        <span className="kyc-page__eyebrow">Founder verification</span>
        <h1>Get verified to list on CEXAID</h1>
        <p>
          Every founder must complete KYC before listing a Private
          Sale round — no exceptions. This protects contributors and keeps
          the marketplace trustworthy.
        </p>
      </div>

      <KycStatus status={kycStatus} rejectionReason={kycRejectionReason} />
      {(kycStatus === "none" || kycStatus === "rejected") && <KycForm onSubmitted={() => {}} />}

      <style jsx>{`
        .kyc-page {
          max-width: 640px;
          margin: 0 auto;
          padding: 1.5rem 1.5rem 5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .kyc-page__back {
          font-family: var(--lp-font-mono);
          font-size: 0.78rem;
          color: var(--lp-mute);
          text-decoration: none;
        }
        .kyc-page__back:hover {
          color: var(--lp-brass);
        }
        .kyc-page__head {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--lp-line);
        }
        .kyc-page__eyebrow {
          font-family: var(--lp-font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--lp-mute);
        }
        .kyc-page__head h1 {
          font-family: var(--lp-font-display);
          font-size: clamp(1.6rem, 4vw, 2.2rem);
          margin: 0;
          color: var(--lp-ink);
        }
        .kyc-page__head p {
          font-family: var(--lp-font-body);
          color: var(--lp-mute);
          margin: 0;
        }
      `}</style>
    </main>
  );
}
