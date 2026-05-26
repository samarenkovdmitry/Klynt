const VIEW_W = 220;
const VIEW_H = 100;
const COLS = 31;
const ROWS = 15;
const CX = VIEW_W / 2;
const CY = VIEW_H / 2;
const RX = 36;
const RY = 40;
const MIN_W = 0.1;
const MAX_W = 1;
const FILL = "#1A3058";

/** Dense at left/right edges, fades toward center (split halves). */
function columnEnvelope(xc: number): number {
  const distFromCenter = Math.abs(xc - CX);
  const d = Math.min(1, distFromCenter / (VIEW_W * 0.5));
  return d * d;
}

/** Sphere profile anchored to nearest horizontal edge. */
function sphereFactor(xc: number, yc: number): number {
  const localX = xc <= CX ? xc : VIEW_W - xc;
  const nx = localX / RX;
  const ny = (yc - CY) / RY;
  const inside = 1 - nx * nx - ny * ny;
  if (inside <= 0) return MIN_W;
  return MIN_W + (MAX_W - MIN_W) * Math.sqrt(inside);
}

function buildRects() {
  const colPitch = VIEW_W / COLS;
  const rects = [];

  for (let col = 0; col < COLS; col++) {
    const xc = (col + 0.5) * colPitch;
    const envelope = columnEnvelope(xc);
    if (envelope <= 0) continue;

    for (let row = 0; row < ROWS; row++) {
      const y0 = (row * VIEW_H) / ROWS;
      const y1 = ((row + 1) * VIEW_H) / ROWS;
      const yc = (y0 + y1) / 2;
      const hw = ((sphereFactor(xc, yc) * colPitch) / 2) * envelope;

      if (hw < 0.02) continue;

      rects.push(
        <rect
          key={`${col}-${row}`}
          x={xc - hw}
          y={y0}
          width={hw * 2}
          height={y1 - y0}
          fill={FILL}
        />
      );
    }
  }

  return rects;
}

/** Edge-dense op-art: split pattern at left/right hero edges, full bleed. */
export function LandingHeroOpArtWide() {
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
        {buildRects()}
      </svg>
    </div>
  );
}
