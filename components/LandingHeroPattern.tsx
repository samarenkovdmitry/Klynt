type PatternCell = {
  x: number;
  y: number;
  length: number;
  thickness: number;
};

type Point = { x: number; y: number };

/** Slightly lighter than hero — opaque so overlaps read as one solid tone. */
const PATTERN_FILL = "#1b335c";

const COLS = 11;
const ROWS = 15;
/** Pitch so thinnest shapes (top-left) touch along the diagonal. */
const SPACING_X = 88;
const SPACING_Y = 50;

const MIN_LENGTH = 118;
const MAX_LENGTH = 340;
const MIN_THICKNESS = 3;
const MAX_THICKNESS = 118;

function lerp(a: Point, b: Point, t: number): Point {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

function progress(col: number, row: number): number {
  const colT = COLS <= 1 ? 1 : col / (COLS - 1);
  const rowT = ROWS <= 1 ? 1 : row / (ROWS - 1);
  const diagonal = Math.min(1, (colT * 0.52 + rowT * 0.48) * 1.08);
  const corner = Math.min(1, Math.hypot(colT, rowT) / Math.SQRT2);
  const blended = Math.max(diagonal, corner * 0.92);
  return Math.pow(blended, 1.65);
}

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
  const endClip = Math.max(3, Math.min(thickness * 0.92, length * 0.12));

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
    for (let row = 0; row < ROWS; row++) {
      const t = progress(col, row);

      if (t < 0.1 && (col + row) % 4 !== 0) continue;
      if (t < 0.22 && (col + row) % 2 !== 0) continue;

      const thickness =
        MIN_THICKNESS + (MAX_THICKNESS - MIN_THICKNESS) * Math.pow(t, 2.1);
      const length =
        MIN_LENGTH + (MAX_LENGTH - MIN_LENGTH) * Math.pow(t, 1.75);

      const stagger = (row % 2) * (SPACING_X * 0.5);
      const x = col * SPACING_X + stagger - 20;
      const y = row * SPACING_Y + col * 4 + 8;

      cells.push({ x, y, length, thickness });
    }
  }

  return cells;
}

/** Bottom-right solid mass — overlapping slabs merge visually. */
const CORNER_MASS: PatternCell[] = [
  { x: 520, y: 720, length: 420, thickness: 200 },
  { x: 640, y: 640, length: 380, thickness: 220 },
  { x: 700, y: 780, length: 360, thickness: 240 },
  { x: 580, y: 860, length: 400, thickness: 210 },
];

const CELLS = [...buildCells(), ...CORNER_MASS];

export function LandingHeroPattern() {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 z-0 w-2/3 overflow-hidden"
      aria-hidden
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 980 1200"
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
            fill={PATTERN_FILL}
          />
        ))}
      </svg>
    </div>
  );
}
