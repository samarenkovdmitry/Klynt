const SCALE_MIN = 320;
const SCALE_MAX = 1440;

const STOPS = [
  { px: 375, label: "Mobile" },
  { px: 768, label: "Tablet" },
  { px: 1280, label: "Desktop" },
] as const;

function pct(px: number) {
  return ((px - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
}

export function ViewportScaleBar({ viewportWidth }: { viewportWidth: number }) {
  const markerPct = pct(Math.min(viewportWidth, SCALE_MAX));
  const safePct = pct(768) - pct(375);
  const problemPct = Math.max(0, pct(Math.min(viewportWidth, SCALE_MAX)) - pct(768));
  const ratio = (viewportWidth / 375).toFixed(1);

  return (
    <div className="space-y-3">
      <span className="font-mono block text-[10.5px] tracking-[0.08em] text-v2-ink-muted uppercase">
        Viewport Width
      </span>

      {/* Breakpoint labels */}
      <div className="relative h-5">
        {STOPS.map(({ px, label }) => {
          const isCurrent = px === Math.min(viewportWidth, 1280);
          return (
            <span
              key={px}
              className={[
                "font-mono absolute -translate-x-1/2 text-[10px] leading-none",
                isCurrent ? "font-semibold text-[#B91C1C]" : "text-v2-ink-muted",
              ].join(" ")}
              style={{ left: `${pct(px)}%` }}
            >
              {px}px{isCurrent ? " ← CURRENT" : ""}
            </span>
          );
        })}
      </div>

      {/* Track */}
      <div className="relative h-2 rounded-full bg-[rgba(0,0,0,0.06)]">
        {/* Green zone: 375–768 */}
        <div
          className="absolute h-full rounded-full bg-[#22C55E]"
          style={{ left: `${pct(375)}%`, width: `${safePct}%` }}
        />
        {/* Red zone: 768 → current */}
        {problemPct > 0 && (
          <div
            className="absolute h-full rounded-full bg-[#EF4444]"
            style={{ left: `${pct(768)}%`, width: `${problemPct}%` }}
          />
        )}
        {/* Marker */}
        <span
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 select-none text-[14px] leading-none text-[#B91C1C]"
          style={{ left: `${markerPct}%` }}
          aria-hidden
        >
          ●
        </span>
      </div>

      {/* Breakpoint tick labels */}
      <div className="relative h-4">
        {STOPS.map(({ px, label }) => (
          <span
            key={px}
            className="font-mono absolute -translate-x-1/2 text-[9.5px] text-v2-ink-muted"
            style={{ left: `${pct(px)}%` }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Caption */}
      <p className="text-[13px] leading-[1.5] text-v2-ink-secondary">
        Mobile visitors see your page at{" "}
        <span className="font-semibold text-[#B91C1C]">{viewportWidth}px</span>
        {" "}—{" "}
        <span className="font-semibold">{ratio}×</span> wider than their screen
      </p>
    </div>
  );
}
