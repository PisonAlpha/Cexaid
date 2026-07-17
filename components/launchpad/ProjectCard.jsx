"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { isRoundPublic } from "@/lib/launchpad/roundStatus";
import { ProjectLogo } from "./ProjectLogo";

const STATUS_LABEL = {
  live: "Ongoing",
  upcoming: "Opening soon",
  closed: "Concluded",
};

function formatUSD(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

export function ProjectCard({ project, rounds }) {
  const publicRounds = rounds.filter((r) => r.projectId === project.id && isRoundPublic(r));
  const round = publicRounds[0]; // one Private Sale round per project
  const status = round?.status ?? "closed";
  const raised = round?.raisedUSD ?? 0;
  const target = round?.totalAllocationUSD ?? 0;
  const pct = target > 0 ? Math.min(100, (raised / target) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={`/launchpad/${project.slug}`} className="pcard">
        <div className="pcard__head">
          <ProjectLogo name={project.name} logoUrl={project.logoUrl} size={44} />
          <div className="pcard__head-text">
            <div className="pcard__name-row">
              <span className="pcard__name">{project.name}</span>
              {project.isDemo && <span className="pcard__demo-badge">DEMO</span>}
            </div>
            <span className={`pcard__status pcard__status--${status}`}>{STATUS_LABEL[status]}</span>
          </div>
        </div>

        <p className="pcard__description">{project.description || project.tagline}</p>

        {round?.chain && <span className="pcard__chain">⛓ {round.chain}</span>}

        <div className="pcard__progress">
          <div className="pcard__progress-track">
            <div className="pcard__progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="pcard__progress-meta">
            <span className="pcard__stat-value">{formatUSD(raised)}</span>
            <span className="pcard__stat-label">of {formatUSD(target)}</span>
          </div>
        </div>

        <style jsx>{`
          .pcard {
            display: flex;
            flex-direction: column;
            gap: 0.85rem;
            background: var(--lp-panel);
            border: 1px solid var(--lp-line);
            border-radius: 6px;
            padding: 1.5rem;
            text-decoration: none;
            transition: border-color 0.15s ease;
          }
          .pcard:hover {
            border-color: var(--lp-brass);
          }
          .pcard__head {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }
          .pcard__head-text {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 0.3rem;
          }
          .pcard__name-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .pcard__name {
            font-family: var(--lp-font-display);
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--lp-ink);
          }
          .pcard__demo-badge {
            font-family: var(--lp-font-mono);
            font-size: 0.6rem;
            letter-spacing: 0.08em;
            color: var(--lp-void);
            background: var(--lp-brass);
            padding: 0.1rem 0.4rem;
            border-radius: 2px;
          }
          .pcard__status {
            font-family: var(--lp-font-mono);
            font-size: 0.65rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--lp-mute);
            width: fit-content;
          }
          .pcard__status--live {
            color: var(--lp-signal-green);
          }
          .pcard__description {
            font-family: var(--lp-font-body);
            font-size: 0.86rem;
            color: var(--lp-mute);
            margin: 0;
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .pcard__chain {
            font-family: var(--lp-font-mono);
            font-size: 0.68rem;
            color: var(--lp-brass);
            width: fit-content;
            border: 1px solid var(--lp-line);
            border-radius: 2px;
            padding: 0.15rem 0.5rem;
          }
          .pcard__progress {
            margin-top: 0.2rem;
          }
          .pcard__progress-track {
            height: 5px;
            background: var(--lp-panel-raised);
            border-radius: 3px;
            overflow: hidden;
          }
          .pcard__progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--lp-brass), var(--lp-brass-bright));
          }
          .pcard__progress-meta {
            display: flex;
            align-items: baseline;
            gap: 0.4rem;
            margin-top: 0.5rem;
          }
          .pcard__stat-value {
            font-family: var(--lp-font-display);
            font-size: 1.15rem;
            font-weight: 600;
            color: var(--lp-brass);
          }
          .pcard__stat-label {
            font-family: var(--lp-font-mono);
            font-size: 0.7rem;
            color: var(--lp-mute);
          }
        `}</style>
      </Link>
    </motion.div>
  );
}
