const SIZE = 100;
const COLS = 17;
const ROWS = 13;
const CX = 50;
const CY = 50;
const RX = 43;
const RY = 43;
const MIN_W = 0.12;
const MAX_W = 0.98;
const FILL = "#1A3058";

function buildRects() {
  const colPitch = SIZE / COLS;
  const rects = [];

  for (let col = 0; col < COLS; col++) {
    const xc = (col + 0.5) * colPitch;

    for (let row = 0; row < ROWS; row++) {
      const y0 = (row * SIZE) / ROWS;
      const y1 = ((row + 1) * SIZE) / ROWS;
      const yc = (y0 + y1) / 2;

      const nx = (xc - CX) / RX;
      const ny = (yc - CY) / RY;
      const inside = 1 - nx * nx - ny * ny;

      let t: number;
      if (inside <= 0) {
        t = 1;
      } else {
        t = 1 - Math.sqrt(inside);
      }

      const hw = ((MIN_W + (MAX_W - MIN_W) * t) * colPitch) / 2;

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
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        {buildRects()}
      </svg>
    </div>
  );
}
