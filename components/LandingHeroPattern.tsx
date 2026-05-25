type HexCell = {
  cx: number;
  cy: number;
  radius: number;
  opacity: number;
};

/** Max hex radius — grid pitch is derived from this so cells never overlap. */
const MAX_R = 58;
const MIN_R = 11;
const COLS = 12;
const ROWS = 16;
const PITCH_X = Math.sqrt(3) * MAX_R * 1.12;
const PITCH_Y = 1.5 * MAX_R * 1.12;

function hexPoints(cx: number, cy: number, radius: number): string {
  const points: string[] = [];

  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    points.push(
      `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`
    );
  }

  return points.join(" ");
}

function buildHexCells(): HexCell[] {
  const cells: HexCell[] = [];

  for (let col = 0; col < COLS; col++) {
    const t = COLS <= 1 ? 1 : col / (COLS - 1);
    const radius = MIN_R + (MAX_R - MIN_R) * Math.pow(t, 1.35);
    const opacity = 0.028 + t * 0.055;
    const rowStride = Math.max(1, Math.ceil(5 - t * 4));
    const colStride = col < 2 ? 2 : col < 6 ? 1 : 1;

    for (let row = 0; row < ROWS; row++) {
      if (row % rowStride !== 0) continue;
      if (col % colStride !== 0 && t < 0.5) continue;

      const cx = col * PITCH_X + (row % 2) * (PITCH_X / 2) - 36;
      const cy = row * PITCH_Y + 48;

      cells.push({ cx, cy, radius, opacity });
    }
  }

  return cells;
}

const HEX_CELLS = buildHexCells();

export function LandingHeroPattern() {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 z-0 w-2/3 overflow-hidden"
      aria-hidden
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 1100 1200"
        preserveAspectRatio="xMaxYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {HEX_CELLS.map((cell, index) => (
          <polygon
            key={index}
            points={hexPoints(cell.cx, cell.cy, cell.radius)}
            fill={`rgba(255,255,255,${cell.opacity})`}
          />
        ))}
      </svg>
    </div>
  );
}
