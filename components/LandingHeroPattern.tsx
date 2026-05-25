type PatternCell = {
  x: number;
  y: number;
  length: number;
  thickness: number;
};

const PATTERN_FILL = "var(--pattern-hero)";

/** ~9×9 reference grid, scaled to cover hero. */
const COLS = 10;
const ROWS = 11;
const PITCH_X = 78;
const PITCH_Y = 68;
const BAR_LENGTH = 64;

function parallelogramPoints(
  x: number,
  y: number,
  length: number,
  thickness: number
): string {
  const ux = Math.SQRT1_2;
  const uy = Math.SQRT1_2;
  const px = -uy;
  const py = ux;
  const hw = thickness / 2;

  const x2 = x + length * ux;
  const y2 = y + length * uy;

  const points = [
    { x: x - px * hw, y: y - py * hw },
    { x: x + px * hw, y: y + py * hw },
    { x: x2 + px * hw, y: y2 + py * hw },
    { x: x2 - px * hw, y: y2 - py * hw },
  ];

  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

function buildCells(): PatternCell[] {
  const cells: PatternCell[] = [];
  const maxIndex = COLS - 1 + ROWS - 1;

  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      const t = maxIndex <= 0 ? 1 : (col + row) / maxIndex;
      const thickness = 1.5 + Math.pow(t, 1.35) * 50;

      const stagger = (row % 2) * (PITCH_X * 0.5);
      const x = col * PITCH_X + stagger - 36;
      const y = row * PITCH_Y + 16;

      cells.push({
        x,
        y,
        length: BAR_LENGTH,
        thickness,
      });
    }
  }

  return cells;
}

const CELLS = buildCells();

export function LandingHeroPattern() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 820 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {CELLS.map((cell, index) => (
          <polygon
            key={index}
            points={parallelogramPoints(
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
