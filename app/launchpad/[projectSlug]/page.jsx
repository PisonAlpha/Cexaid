"use client";

import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { useLaunchpad } from "@/lib/launchpad/LaunchpadContext";
import { isRoundPublic } from "@/lib/launchpad/roundStatus";
import { RoundCard } from "@/components/launchpad/RoundCard";
import { ContributionForm } from "@/components/launchpad/ContributionForm";
import { VestingSchedule } from "@/components/launchpad/VestingSchedule";
import { InvestorStatus } from "@/components/launchpad/InvestorStatus";
import { PendingReviewCard } from "@/components/launchpad/PendingReviewCard";
import { WalletConnectButton } from "@/components/launchpad/WalletConnectButton";
import { CopyLinkButton } from "@/components/launchpad/CopyLinkButton";
import { ProjectLogo } from "@/components/launchpad/ProjectLogo";
import { Collapsible } from "@/components/launchpad/Collapsible";
import { ContributorsList } from "@/components/launchpad/ContributorsList";

export default function ProjectPage() {
  const params = useParams();
  const { projects, rounds, wallet, myApplication, contributions, loaded } = useLaunchpad();
  const project = projects.find((p) => p.slug === params.projectSlug);

  if (!loaded) {
    return (
      <main className="project">
        <p className="project__loading">Loading…</p>
        <style jsx>{`
          .project__loading {
            max-width: 1080px;
            margin: 4rem auto;
            padding: 0 1.5rem;
            font-family: var(--lp-font-body);
            color: var(--lp-mute);
          }
        `}</style>
      </main>
    );
  }

  if (!project) return notFound();

  const isFounder = wallet.address && wallet.address === project.founderWallet;

  const projectRounds = rounds
    .filter((r) => r.projectId === project.id)
    .filter((r) => isRoundPublic(r) || isFounder)
    .sort((a, b) => a.roundNumber - b.roundNumber);

  const investorStatus = wallet.isApprovedInvestor
    ? "approved"
    : myApplication?.status ?? "none";

  return (
    <main className="project">
      <Link href="/launchpad" className="project__back">
        ← Marketplace
      </Link>

      <div className="project__header">
        <div className="project__header-top">
          <ProjectLogo name={project.name} logoUrl={project.logoUrl} size={64} />
          <div className="project__header-text">
            <div className="project__name-row">
              <h1>{project.name}</h1>
              {project.isDemo && <span className="project__demo-badge">DEMO LISTING</span>}
            </div>
            <p className="project__tagline">{project.tagline}</p>
          </div>
          <div className="project__header-actions">
            <CopyLinkButton />
            <WalletConnectButton />
          </div>
        </div>

        {project.description && <p className="project__description">{project.description}</p>}

        {(project.website || project.twitter || project.telegram) && (
          <div className="project__links">
            {project.website && (
              <a href={project.website} target="_blank" rel="noreferrer">
                Website
              </a>
            )}
            {project.twitter && (
              <a href={project.twitter} target="_blank" rel="noreferrer">
                Twitter
              </a>
            )}
            {project.telegram && (
              <a href={project.telegram} target="_blank" rel="noreferrer">
                Telegram
              </a>
            )}
          </div>
        )}
      </div>

      <div className="project__rounds">
        {projectRounds.map((round) => {
          const isPublic = isRoundPublic(round);
          const gated = round.requiresApproval && !wallet.isApprovedInvestor;

          return (
            <div className="project__round" key={round.id}>
              <RoundCard round={round} />

              <div className="project__round-detail">
                {!isPublic && <PendingReviewCard status={round.approvalStatus} />}

                {isPublic && (
                  <>
                    <Collapsible
                      title="Claim / vesting schedule"
                      subtitle={`Converts to ${round.tokenSymbol} once TGE is announced`}
                    >
                      <VestingSchedule steps={round.vestingSchedule} />
                    </Collapsible>

                    <Collapsible
                      title="Contributors"
                      subtitle={`${contributions.filter((c) => c.roundId === round.id).length} contribution(s) on ${round.chain || "BNB Chain"}`}
                    >
                      <ContributorsList
                        contributions={contributions.filter((c) => c.roundId === round.id)}
                        chain={round.chain}
                      />
                    </Collapsible>

                    {round.requiresApproval && (
                      <div className="project__card">
                        <h4>Your investor status</h4>
                        <InvestorStatus status={investorStatus} />
                        {investorStatus !== "approved" && (
                          <Link href="/launchpad/apply-investor" className="project__apply-link">
                            Apply for platform-wide investor access →
                          </Link>
                        )}
                      </div>
                    )}

                    {!gated && !project.isDemo && <ContributionForm round={round} />}
                    {!gated && project.isDemo && (
                      <div className="project__card project__demo-notice">
                        <h4>Demo listing</h4>
                        <p className="project__vesting-note">
                          This project is shown for illustration purposes
                          only and cannot accept real contributions.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .project {
          max-width: 1080px;
          margin: 0 auto;
          padding: 1.5rem 1.5rem 5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .project__back {
          font-family: var(--lp-font-mono);
          font-size: 0.78rem;
          color: var(--lp-mute);
          text-decoration: none;
        }
        .project__back:hover {
          color: var(--lp-brass);
        }
        .project__header {
          background: var(--lp-panel);
          border: 1px solid var(--lp-line);
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }
        .project__header-top {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .project__header-text {
          flex: 1;
          min-width: 200px;
        }
        .project__header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .project__name-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .project__demo-badge {
          font-family: var(--lp-font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.08em;
          color: var(--lp-void);
          background: var(--lp-brass);
          padding: 0.2rem 0.55rem;
          border-radius: 2px;
        }
        .project__demo-notice {
          border-color: var(--lp-brass);
        }
        .project__header-text h1 {
          font-family: var(--lp-font-display);
          font-size: clamp(1.6rem, 4vw, 2.2rem);
          margin: 0;
          color: var(--lp-ink);
        }
        .project__tagline {
          font-family: var(--lp-font-body);
          color: var(--lp-mute);
          margin: 0.25rem 0 0;
        }
        .project__description {
          font-family: var(--lp-font-body);
          color: var(--lp-mute);
          font-size: 0.92rem;
          line-height: 1.6;
          max-width: 700px;
          margin: 0;
          padding-top: 0.25rem;
          border-top: 1px solid var(--lp-line);
        }
        .project__links {
          display: flex;
          gap: 1rem;
        }
        .project__links a {
          font-family: var(--lp-font-mono);
          font-size: 0.78rem;
          color: var(--lp-brass);
          text-decoration: none;
        }
        .project__rounds {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .project__round {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          align-items: start;
        }
        .project__round-detail {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .project__card {
          background: var(--lp-panel);
          border: 1px solid var(--lp-line);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }
        .project__card--muted {
          opacity: 0.85;
        }
        .project__card h4 {
          font-family: var(--lp-font-display);
          font-size: 1.05rem;
          margin: 0;
          color: var(--lp-ink);
        }
        .project__vesting-note {
          font-family: var(--lp-font-body);
          font-size: 0.8rem;
          color: var(--lp-mute);
          margin: -0.5rem 0 0;
        }
        .project__apply-link {
          font-family: var(--lp-font-mono);
          font-size: 0.8rem;
          color: var(--lp-brass);
          text-decoration: none;
        }
        @media (max-width: 800px) {
          .project__round {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
