type PatternCell = {
  x: number;
  y: number;
  length: number;
  thickness: number;
  opacity: number;
};

type Point = { x: number; y: number };

const COLS = 17;
const ROWS = 38;
const SPACING_X = 96;
const SPACING_Y = 54;

const MAX_THICKNESS = 22;
const MIN_THICKNESS = 1.5;

function lerp(a: Point, b: Point, t: number): Point {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

/** Elongated hexagon at 45° — long sides diagonal, short capped ends (Swiss grid). */
function elongatedHexagonPoints(
  x: number,
  y: number,
  length: number,
  thickness: number
): string {
  const nx = Math.SQRT1_2;
  const ny = -Math.SQRT1_2;
  const px = Math.SQRT1_2;
  const py = Math.SQRT1_2;
  const hw = thickness / 2;
  const endClip = Math.max(2.5, Math.min(thickness * 0.95, length * 0.14));

  const x2 = x + length * nx;
  const y2 = y + length * ny;

  const a: Point = { x: x + px * hw, y: y + py * hw };
  const b: Point = { x: x2 + px * hw, y: y2 + py * hw };
  const c: Point = { x: x2 - px * hw, y: y2 - py * hw };
  const d: Point = { x: x - px * hw, y: y - py * hw };

  const along = endClip / Math.max(length, 1);

  const dSide = lerp(d, c, along);
  const aSide = lerp(a, b, along);
  const capStart: Point = {
    x: (dSide.x + aSide.x) / 2 - nx * endClip * 0.4,
    y: (dSide.y + aSide.y) / 2 - ny * endClip * 0.4,
  };

  const bSide = lerp(b, a, along);
  const cSide = lerp(c, d, along);
  const capEnd: Point = {
    x: (bSide.x + cSide.x) / 2 + nx * endClip * 0.4,
    y: (bSide.y + cSide.y) / 2 + ny * endClip * 0.4,
  };

  return [dSide, capStart, aSide, bSide, capEnd, cSide]
    .map((p) => `${p.x},${p.y}`)
    .join(" ");
}

function buildCells(): PatternCell[] {
  const cells: PatternCell[] = [];

  for (let col = 0; col < COLS; col++) {
    const t = COLS <= 1 ? 1 : col / (COLS - 1);
    const thickness = MIN_THICKNESS + (MAX_THICKNESS - MIN_THICKNESS) * Math.pow(t, 1.3);
    const length = 52 + t * 56;
    const opacity = 0.03 + t * 0.058;
    const rowStride = Math.max(1, Math.ceil(3 - t * 2.2));
    const colStride = col < 1 ? 2 : 1;

    for (let row = 0; row < ROWS; row++) {
      if (row % rowStride !== 0) continue;
      if (col % colStride !== 0 && t < 0.35) continue;

      const stagger = (row % 2) * (SPACING_X * 0.5);
      const x = col * SPACING_X + stagger - 28;
      const y = row * SPACING_Y + col * 5 + 24;

      cells.push({ x, y, length, thickness, opacity });
    }
  }

  return cells;
}

const CELLS = buildCells();

export function LandingHeroPattern() {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 z-0 w-2/3 overflow-hidden"
      aria-hidden
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 1000 1200"
        preserveAspectRatio="xMaxYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {CELLS.map((cell, index) => (
          <polygon
            key={index}
            points={elongatedHexagonPoints(
              cell.x,
              cell.y,
              cell.length,
              cell.thickness
            )}
            fill={`rgba(255,255,255,${cell.opacity})`}
          />
        ))}
      </svg>
    </div>
  );
}
