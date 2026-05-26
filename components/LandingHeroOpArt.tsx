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
const EDGE_FADE = VIEW_W * 0.5;
const FILL = "#1A3058";

function columnEnvelope(xc: number): number {
  const d = Math.abs(xc - CX) / EDGE_FADE;
  if (d >= 1) return 0;
  const t = 1 - d;
  return t * t;
}

function sphereFactor(xc: number, yc: number): number {
  const nx = (xc - CX) / RX;
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

export function LandingHeroOpArt() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <svg
        className="absolute left-[calc(50%+200px)] top-0 h-full w-auto max-w-none -translate-x-1/2 md:left-[calc(50%+400px)]"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        {buildRects()}
      </svg>
    </div>
  );
}
