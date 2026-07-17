"use client";

import { useState } from "react";
import Link from "next/link";
import { PrivateSaleListingForm } from "@/components/launchpad/PrivateSaleListingForm";
import { PendingReviewCard } from "@/components/launchpad/PendingReviewCard";
import { KycStatus } from "@/components/launchpad/KycStatus";
import { useLaunchpad } from "@/lib/launchpad/LaunchpadContext";

export default function ApplyPrivateSalePage() {
  const { projects, rounds, kycStatus, kycRejectionReason } = useLaunchpad();
  const [result, setResult] = useState(null);

  const project = projects.find((p) => p.id === result?.projectId);
  const round = rounds.find((r) => r.id === result?.roundId);
  const kycApproved = kycStatus === "approved";

  return (
    <main className="apply-page">
      <Link href="/launchpad" className="apply-page__back">
        ← Marketplace
      </Link>

      <div className="apply-page__head">
        <span className="apply-page__eyebrow">Private Sale</span>
        <h1>Apply for Private Sale — reviewed by CEXAID</h1>
        <p>
          Reserved for CEXAID-approved investors and VCs. No listing fee —
          your project is reviewed before the round goes public.
        </p>
      </div>

      {!kycApproved && (
        <>
          <KycStatus status={kycStatus} rejectionReason={kycRejectionReason} />
          <p className="apply-page__kyc-note">
            KYC approval is required before listing.{" "}
            <Link href="/launchpad/kyc">Submit KYC →</Link>
          </p>
        </>
      )}

      {kycApproved && !result && <PrivateSaleListingForm onCreated={(r) => setResult(r)} />}

      {result && (
        <div className="apply-page__steps">
          <PendingReviewCard status={round?.approvalStatus ?? "pending_review"} />
          <Link href={`/launchpad/${project?.slug}`} className="apply-page__view">
            View your project page →
          </Link>
        </div>
      )}

      <style jsx>{`
        .apply-page {
          max-width: 720px;
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
        .apply-page__head a {
          color: var(--lp-brass);
        }
        .apply-page__steps {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .apply-page__kyc-note {
          font-family: var(--lp-font-body);
          font-size: 0.85rem;
          color: var(--lp-mute);
          margin: 0;
        }
        .apply-page__kyc-note :global(a) {
          color: var(--lp-brass);
        }
        .apply-page__view {
          color: var(--lp-brass);
          font-family: var(--lp-font-mono);
          font-size: 0.85rem;
          text-decoration: none;
        }
      `}</style>
    </main>
  );
}
