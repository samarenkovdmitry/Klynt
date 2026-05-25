const PATTERN_FILL = "#14254A";

const COLS = 4;
const CELL = 80;
const VIEW_W = COLS * CELL;
const ROW_COUNT = 20;
const VIEW_H = ROW_COUNT * CELL;

/** Left → right: thin slash, band, clipped square, solid square. */
function cellPolygon(col: number, x: number, y: number, size: number): string {
  switch (col) {
    case 0: {
      const t = size * 0.11;
      const o = size * 0.395;
      return `${x + o},${y} ${x + o + t},${y} ${x + o + t},${y + size} ${x + o},${y + size}`;
    }
    case 1: {
      const o = size * 0.14;
      return `${x + o},${y} ${x + size - o},${y} ${x + size - o},${y + size} ${x + o},${y + size}`;
    }
    case 2: {
      const cut = size * 0.34;
      return `${x + cut},${y} ${x + size},${y} ${x + size},${y + size} ${x},${y + size} ${x},${y + cut}`;
    }
    default:
      return `${x},${y} ${x + size},${y} ${x + size},${y + size} ${x},${y + size}`;
  }
}

function buildShapes() {
  const shapes = [];

  for (let row = 0; row < ROW_COUNT; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * CELL;
      const y = row * CELL;
      shapes.push(
        <polygon
          key={`${col}-${row}`}
          points={cellPolygon(col, x, y, CELL)}
          fill={PATTERN_FILL}
        />
      );
    }
  }

  return shapes;
}

export function LandingHeroPattern() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <svg
        className="absolute right-0 top-0 h-full w-auto"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMaxYMin slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {buildShapes()}
      </svg>
    </div>
  );
}
