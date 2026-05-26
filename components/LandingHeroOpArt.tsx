const VIEW_W = 400;
const VIEW_H = 100;
const COLS = 43;
const CY = VIEW_H / 2;
const PEAK_X = VIEW_W * 0.78;
const BLOB_R = VIEW_W * 0.25;
const FILL = "#1A3058";
const GRID_FILL = "#1A3058";

/** Wrapped distance → cluster peak shifted right, tail wraps to left edge. */
function columnEnvelope(xc: number): number {
  const d = Math.abs(xc - PEAK_X);
  const wrapped = Math.min(d, VIEW_W - d);
  const t = 1 - wrapped / BLOB_R;
  if (t <= 0) return 0;
  return t * t;
}

function buildPattern() {
  const colPitch = VIEW_W / COLS;
  const thinHw = colPitch * 0.055;
  const shapes = [];

  for (let col = 0; col < COLS; col++) {
    const xc = (col + 0.5) * colPitch;

    shapes.push(
      <rect
        key={`grid-${col}`}
        x={xc - thinHw}
        y={0}
        width={thinHw * 2}
        height={VIEW_H}
        fill={GRID_FILL}
        opacity={0.35}
      />
    );

    const envelope = columnEnvelope(xc);
    if (envelope < 0.03) continue;

    const thickHw = colPitch * (0.07 + 0.43 * envelope);
    const thickH = VIEW_H * (0.1 + 0.78 * envelope);
    const y0 = CY - thickH / 2;

    shapes.push(
      <rect
        key={`bar-${col}`}
        x={xc - thickHw}
        y={y0}
        width={thickHw * 2}
        height={thickH}
        fill={FILL}
      />
    );
  }

  return shapes;
}

export function LandingHeroOpArt() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        {buildPattern()}
      </svg>
    </div>
  );
}
