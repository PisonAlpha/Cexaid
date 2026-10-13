export function Sparkline({ data, width = 120, height = 36 }) {
  if (!data || data.length < 2) return <span style={{ color: "var(--lp-mute)" }}>—</span>;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => `${((i / (data.length - 1)) * width).toFixed(1)},${(height - ((v - min) / range) * (height - 4) - 2).toFixed(1)}`)
    .join(" ");
  const up = data[data.length - 1] >= data[0];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline fill="none" stroke={up ? "#16c784" : "#ea3943"} strokeWidth="1.5" points={pts} />
    </svg>
  );
}
