export function ProjectLogo({ name, logoUrl, size = 56 }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="project-logo" style={{ width: size, height: size }}>
      {logoUrl ? (
        <img src={logoUrl} alt={`${name} logo`} />
      ) : (
        <span style={{ fontSize: Math.round(size * 0.42) }}>{initial}</span>
      )}
      <style jsx>{`
        .project-logo {
          flex-shrink: 0;
          border-radius: 6px;
          border: 1px solid var(--lp-line);
          background: var(--lp-panel-raised);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .project-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .project-logo span {
          font-family: var(--lp-font-display);
          font-weight: 600;
          color: var(--lp-brass);
        }
      `}</style>
    </div>
  );
}
