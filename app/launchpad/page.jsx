"use client";

import { useState } from "react";
import Link from "next/link";
import { isRoundPublic } from "@/lib/launchpad/roundStatus";
import { LedgerTape } from "@/components/launchpad/LedgerTape";
import { ProjectCard } from "@/components/launchpad/ProjectCard";
import { StatBlock } from "@/components/launchpad/StatBlock";
import { WalletConnectButton } from "@/components/launchpad/WalletConnectButton";
import { useLaunchpad } from "@/lib/launchpad/LaunchpadContext";

export default function LaunchpadMarketplace() {
  const { liveProjects, rounds, wallet } = useLaunchpad();
  const [menuOpen, setMenuOpen] = useState(false);

  const publicProjectRounds = (project) =>
    rounds.filter((r) => r.projectId === project.id && isRoundPublic(r));

  const ongoingProjects = liveProjects.filter((p) =>
    publicProjectRounds(p).some((r) => r.status === "live" || r.status === "upcoming")
  );
  const concludedProjects = liveProjects.filter((p) =>
    publicProjectRounds(p).every((r) => r.status === "closed")
  );

  const liveRounds = rounds.filter((r) => r.status === "live" && isRoundPublic(r));
  const totalRaised = rounds.filter(isRoundPublic).reduce((sum, r) => sum + r.raisedUSD, 0);

  return (
    <main className="hub">
      <header className="hub__top">
        <span className="hub__brand">CEXAID LAUNCHPAD</span>
        <button
          type="button"
          aria-label="Toggle menu"
          className="hub__menu-btn"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className={`hub__menu-bar ${menuOpen ? "hub__menu-bar--1open" : ""}`} />
          <span className={`hub__menu-bar ${menuOpen ? "hub__menu-bar--2open" : ""}`} />
          <span className={`hub__menu-bar ${menuOpen ? "hub__menu-bar--3open" : ""}`} />
        </button>
        <div className={`hub__top-actions ${menuOpen ? "hub__top-actions--open" : ""}`}>
          <Link href="/launchpad/apply-investor" className="hub__link" onClick={() => setMenuOpen(false)}>
            Apply as investor
          </Link>
          <Link href="/launchpad/kyc" className="hub__link" onClick={() => setMenuOpen(false)}>
            Founder KYC
          </Link>
          <Link href="/launchpad/apply-private-sale" className="hub__cta" onClick={() => setMenuOpen(false)}>
            Apply for Private Sale
          </Link>
          <WalletConnectButton />
        </div>
      </header>

      <LedgerTape />

      <section className="hub__hero">
        <span className="hub__eyebrow">The marketplace for private token sales</span>
        <h1 className="hub__headline">
          Every Private Sale.
          <br />
          One ledger.
        </h1>
        <p className="hub__sub">
          CEXAID Launchpad hosts Private Sale rounds only. Every round is
          reviewed by CEXAID before it goes live, and only platform-approved
          investors can contribute — apply once, unlock every project.
        </p>

        <div className="hub__stats">
          <StatBlock label="Live projects" value={String(liveProjects.length)} />
          <StatBlock label="Rounds open now" value={String(liveRounds.length)} />
          <StatBlock label="Total raised" value={`$${totalRaised.toLocaleString()}`} />
        </div>

        {wallet.address && (
          <div className="hub__status">
            {wallet.isApprovedInvestor ? (
              <span className="hub__status--approved">
                ✓ Approved investor — you can contribute to any Private Sale below.
              </span>
            ) : (
              <span>
                Not yet an approved investor.{" "}
                <Link href="/launchpad/apply-investor">Apply for access</Link> to unlock Private
                Sale rounds platform-wide.
              </span>
            )}
          </div>
        )}
      </section>

      <section className="hub__section">
        <div className="hub__section-head">
          <span className="hub__section-number">01</span>
          <h2>Ongoing Private Sales ({ongoingProjects.length})</h2>
        </div>
        <div className="hub__projects">
          {ongoingProjects.map((project) => (
            <ProjectCard key={project.id} project={project} rounds={rounds} />
          ))}
        </div>
        {ongoingProjects.length === 0 && (
          <p className="hub__empty">No ongoing rounds right now.</p>
        )}
      </section>

      <section className="hub__section">
        <div className="hub__section-head">
          <span className="hub__section-number">02</span>
          <h2>Concluded Private Sales ({concludedProjects.length})</h2>
        </div>
        <div className="hub__projects">
          {concludedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} rounds={rounds} />
          ))}
        </div>
        {concludedProjects.length === 0 && (
          <p className="hub__empty">No concluded rounds yet.</p>
        )}
      </section>

      <section className="hub__section hub__how">
        <div className="hub__section-head">
          <span className="hub__section-number">03</span>
          <h2>How it works</h2>
        </div>
        <ol className="hub__steps">
          <li>
            <strong>Founders get verified.</strong> KYC is required before
            any project can list — no exceptions.
          </li>
          <li>
            <strong>CEXAID reviews every round.</strong> Terms, vesting
            schedule, and allocation are checked before anything goes public.
          </li>
          <li>
            <strong>Investors apply once.</strong> Approved investors get
            Private Sale access on every project on the platform — no
            re-applying per project.
          </li>
        </ol>
      </section>

      <footer className="hub__footer">
        <Link href="/">CEXAID Home</Link>
        <Link href="/about">Team &amp; Contact</Link>
        <Link href="/terms">Terms of Service</Link>
        <Link href="/privacy">Privacy Policy</Link>
      </footer>

      <style jsx>{`
        .hub {
          max-width: 1080px;
          margin: 0 auto;
          padding: 1.5rem 1.5rem 5rem;
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }
        .hub__top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .hub__brand {
          font-family: var(--lp-font-mono);
          font-size: 0.8rem;
          letter-spacing: 0.15em;
          color: var(--lp-brass);
        }
        .hub__top-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .hub__menu-btn {
          display: none;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          width: 40px;
          height: 40px;
          border: 1px solid var(--lp-line);
          border-radius: 50%;
          background: transparent;
          cursor: pointer;
        }
        .hub__menu-bar {
          display: block;
          width: 16px;
          height: 2px;
          margin: 0 auto;
          background: var(--lp-ink);
          transition: transform 0.15s ease, opacity 0.15s ease;
        }
        .hub__menu-bar--1open {
          transform: translateY(7px) rotate(45deg);
        }
        .hub__menu-bar--2open {
          opacity: 0;
        }
        .hub__menu-bar--3open {
          transform: translateY(-7px) rotate(-45deg);
        }
        @media (max-width: 760px) {
          .hub__menu-btn {
            display: flex;
          }
          .hub__top-actions {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            margin-top: 0.5rem;
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
            background: var(--lp-panel);
            border: 1px solid var(--lp-line);
            border-radius: 8px;
            padding: 1rem;
            z-index: 20;
          }
          .hub__top-actions--open {
            display: flex;
          }
          .hub__top {
            position: relative;
          }
        }
        .hub__link {
          font-family: var(--lp-font-mono);
          font-size: 0.78rem;
          color: var(--lp-mute);
          text-decoration: none;
        }
        .hub__link:hover {
          color: var(--lp-brass);
        }
        .hub__cta {
          font-family: var(--lp-font-body);
          font-weight: 600;
          font-size: 0.82rem;
          color: var(--lp-brass);
          border: 1px solid var(--lp-brass);
          border-radius: 2px;
          padding: 0.45rem 0.8rem;
          text-decoration: none;
        }
        .hub__hero {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: 2.5rem 0 1.5rem;
          border-bottom: 1px solid var(--lp-line);
        }
        .hub__eyebrow {
          font-family: var(--lp-font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--lp-mute);
        }
        .hub__headline {
          font-family: var(--lp-font-display);
          font-weight: 600;
          font-size: clamp(2rem, 5vw, 3.2rem);
          line-height: 1.1;
          margin: 0;
          color: var(--lp-ink);
        }
        .hub__sub {
          font-family: var(--lp-font-body);
          font-size: 1rem;
          color: var(--lp-mute);
          max-width: 560px;
          line-height: 1.6;
          margin: 0;
        }
        .hub__stats {
          display: flex;
          gap: 1.5rem;
          margin-top: 0.5rem;
        }
        .hub__status {
          font-family: var(--lp-font-body);
          font-size: 0.85rem;
          color: var(--lp-mute);
          background: var(--lp-panel);
          border: 1px solid var(--lp-line);
          padding: 0.7rem 1rem;
          border-radius: 2px;
        }
        .hub__status--approved {
          color: var(--lp-signal-green);
        }
        .hub__status :global(a) {
          color: var(--lp-brass);
        }
        .hub__section {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .hub__section-head {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
        }
        .hub__section-number {
          font-family: var(--lp-font-mono);
          font-size: 0.85rem;
          color: var(--lp-brass);
        }
        .hub__section-head h2 {
          font-family: var(--lp-font-display);
          font-size: 1.5rem;
          margin: 0;
          color: var(--lp-ink);
        }
        .hub__projects {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.25rem;
        }
        .hub__empty {
          font-family: var(--lp-font-body);
          color: var(--lp-mute);
          font-size: 0.9rem;
        }
        .hub__empty :global(a) {
          color: var(--lp-brass);
        }
        .hub__steps {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          padding: 0;
          margin: 0;
          list-style: none;
        }
        .hub__steps li {
          font-family: var(--lp-font-body);
          font-size: 0.92rem;
          color: var(--lp-mute);
          line-height: 1.6;
          padding: 0.9rem 0;
          border-bottom: 1px solid var(--lp-line);
        }
        .hub__steps li:last-child {
          border-bottom: none;
        }
        .hub__steps strong {
          color: var(--lp-ink);
          font-family: var(--lp-font-display);
          font-weight: 600;
          margin-right: 0.35rem;
        }
        .hub__footer {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 1.5rem;
          padding-top: 2rem;
          border-top: 1px solid var(--lp-line);
        }
        .hub__footer :global(a) {
          font-family: var(--lp-font-mono);
          font-size: 0.78rem;
          color: var(--lp-mute);
          text-decoration: none;
        }
        .hub__footer :global(a:hover) {
          color: var(--lp-brass);
        }
        @media (max-width: 640px) {
          .hub__stats {
            flex-wrap: wrap;
            gap: 1rem;
          }
        }
      `}</style>
    </main>
  );
}
