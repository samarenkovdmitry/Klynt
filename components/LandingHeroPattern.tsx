const PATTERN_FILL = "#15274D";
const COLS = 4;
const CELL_W = 138;
const CELL_H = 148;
const PATTERN_WIDTH = COLS * CELL_W;
const ROWS = 12;
const PATTERN_HEIGHT = ROWS * CELL_H;

function cellPolygon(col: number, x: number, y: number, w: number, h: number): string {
  switch (col) {
    case 0: {
      const t = w * 0.11;
      const o = w * 0.395;
      return `${x + o},${y} ${x + o + t},${y} ${x + o + t},${y + h} ${x + o},${y + h}`;
    }
    case 1: {
      const o = w * 0.14;
      return `${x + o},${y} ${x + w - o},${y} ${x + w - o},${y + h} ${x + o},${y + h}`;
    }
    case 2: {
      const cutX = w * 0.34;
      const cutY = h * 0.34;
      return `${x + cutX},${y} ${x + w},${y} ${x + w},${y + h} ${x},${y + h} ${x},${y + cutY}`;
    }
    default:
      return `${x},${y} ${x + w},${y} ${x + w},${y + h} ${x},${y + h}`;
  }
}

function buildPatternShapes() {
  const shapes = [];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * CELL_W;
      const y = row * CELL_H;
      shapes.push(
        <polygon
          key={`${col}-${row}`}
          points={cellPolygon(col, x, y, CELL_W, CELL_H)}
          fill={PATTERN_FILL}
        />
      );
    }
  }

  return shapes;
}

export function LandingHeroPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <svg
        className="pointer-events-none absolute top-0 max-w-none"
        viewBox={`0 0 ${PATTERN_WIDTH} ${PATTERN_HEIGHT}`}
        preserveAspectRatio="xMinYMin slice"
        width={PATTERN_WIDTH}
        style={{
          left: "40%",
          width: PATTERN_WIDTH,
          minWidth: PATTERN_WIDTH,
          height: "100%",
        }}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        {buildPatternShapes()}
      </svg>
    </div>
  );
}
