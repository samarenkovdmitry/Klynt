const VIEW_W = 240;
const VIEW_H = 140;
const COLS = 48;
const ROWS = 28;
const CX = VIEW_W / 2;
const CY = VIEW_H / 2;
const MIN_W = 0.06;
const MAX_W = 1;
const FILL = "#1A3058";

/** Thin at center, dense toward edges (inverted sphere). */
function lineWidthFactor(xc: number, yc: number): number {
  const nx = (xc - CX) / (VIEW_W * 0.48);
  const ny = (yc - CY) / (VIEW_H * 0.48);
  const dist = Math.min(1, Math.sqrt(nx * nx + ny * ny));
  const t = dist * dist;
  return MIN_W + (MAX_W - MIN_W) * t;
}

function buildRects() {
  const colPitch = VIEW_W / COLS;
  const rects = [];

  for (let col = 0; col < COLS; col++) {
    const xc = (col + 0.5) * colPitch;

    for (let row = 0; row < ROWS; row++) {
      const y0 = (row * VIEW_H) / ROWS;
      const y1 = ((row + 1) * VIEW_H) / ROWS;
      const yc = (y0 + y1) / 2;
      const hw = (lineWidthFactor(xc, yc) * colPitch) / 2;

      if (hw < 0.015) continue;

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

export function LandingHeroOpArt() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      <svg
        className="h-full w-full"
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
