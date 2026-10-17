// CEXAID logo mark: a bold "C" with a gold coin in its opening. Same artwork as /logo.svg and the browser-tab icon.
export function LogoMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="cx-logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4b82ff" />
          <stop offset="1" stopColor="#1f4fd1" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill="url(#cx-logo-g)" />
      <path d="M44.6 19.4A18 18 0 1 0 44.6 44.6" fill="none" stroke="#ffffff" strokeWidth="8.5" strokeLinecap="round" />
      <circle cx="47.5" cy="32" r="5" fill="#ffd166" />
    </svg>
  );
}
