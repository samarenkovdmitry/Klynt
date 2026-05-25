type DiagonalBar = {
  x: number;
  y: number;
  length: number;
  thickness: number;
  opacity: number;
};

const COLS = 20;
const ROWS = 34;
const SPACING_X = 40;
const SPACING_Y = 36;

function buildBars(): DiagonalBar[] {
  const bars: DiagonalBar[] = [];

  for (let col = 0; col < COLS; col++) {
    const t = COLS <= 1 ? 1 : col / (COLS - 1);
    const thickness = 1.25 + Math.pow(t, 1.35) * 20;
    const opacity = 0.028 + t * 0.055;
    const rowStride = Math.max(1, Math.ceil(5 - t * 4));
    const colStride = col < 3 ? 2 : col < 7 ? 1 : 1;

    for (let row = 0; row < ROWS; row++) {
      if (row % rowStride !== 0) continue;
      if (col % colStride !== 0 && t < 0.45) continue;

      const stagger = (row % 2) * (SPACING_X * 0.48);
      const x = col * SPACING_X + stagger - 24;
      const y = row * SPACING_Y + col * 6 + 40;
      const length = 44 + t * 36;

      bars.push({ x, y, length, thickness, opacity });
    }
  }

  return bars;
}

const BARS = buildBars();

function barPolygon(
  x: number,
  y: number,
  length: number,
  thickness: number
): string {
  const nx = 0.70710678;
  const ny = -0.70710678;
  const px = 0.70710678;
  const py = 0.70710678;
  const half = thickness / 2;

  const x2 = x + length * nx;
  const y2 = y + length * ny;

  const points = [
    [x + px * half, y + py * half],
    [x2 + px * half, y2 + py * half],
    [x2 - px * half, y2 - py * half],
    [x - px * half, y - py * half],
  ];

  return points.map(([px, py]) => `${px},${py}`).join(" ");
}

export function LandingHeroPattern() {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 z-0 w-1/2 overflow-hidden"
      aria-hidden
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 820 1200"
        preserveAspectRatio="xMaxYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {BARS.map((bar, index) => (
          <polygon
            key={index}
            points={barPolygon(bar.x, bar.y, bar.length, bar.thickness)}
            fill={`rgba(255,255,255,${bar.opacity})`}
          />
        ))}
      </svg>
    </div>
  );
}
