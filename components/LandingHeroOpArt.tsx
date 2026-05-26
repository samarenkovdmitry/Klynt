const VIEW_W = 400;
const VIEW_H = 100;
const COLS = 43;
const ROWS = 15;
const CY = VIEW_H / 2;
const PEAK_X = VIEW_W * 0.71;
const CLUSTER_HW = VIEW_W * 0.155;
const LEFT_TAIL_X = VIEW_W * 0.045;
const LEFT_TAIL_HW = VIEW_W * 0.065;
const RX = 34;
const RY = 38;
const MIN_W = 0.1;
const MAX_W = 1;
const FILL = "#1A3058";

function columnEnvelope(xc: number): number {
  const mainD = Math.abs(xc - PEAK_X) / CLUSTER_HW;
  let main = 0;
  if (mainD < 1) {
    const t = 1 - mainD;
    main = t * t;
  }

  const leftD = Math.abs(xc - LEFT_TAIL_X) / LEFT_TAIL_HW;
  let left = 0;
  if (leftD < 1) {
    const t = 1 - leftD;
    left = t * t * 0.38;
  }

  return Math.max(main, left);
}

function rowFactor(xc: number, yc: number, useLeftTail: boolean): number {
  const anchorX = useLeftTail ? LEFT_TAIL_X : PEAK_X;
  const rx = useLeftTail ? RX * 0.42 : RX;
  const ry = useLeftTail ? RY * 0.48 : RY;
  const nx = (xc - anchorX) / rx;
  const ny = (yc - CY) / ry;
  const inside = 1 - nx * nx - ny * ny;
  if (inside <= 0) return MIN_W;
  return MIN_W + (MAX_W - MIN_W) * Math.sqrt(inside);
}

function buildPattern() {
  const colPitch = VIEW_W / COLS;
  const thinHw = colPitch * 0.05;
  const shapes = [];

  for (let col = 0; col < COLS; col++) {
    const xc = (col + 0.5) * colPitch;

    shapes.push(
      <rect
        key={`grid-${col}`}
        x={xc - thinHw}
        y={0}
        width={thinHw * 2}
        height={VIEW_H}
        fill={FILL}
        opacity={0.32}
      />
    );

    const envelope = columnEnvelope(xc);
    if (envelope <= 0) continue;

    const mainD = Math.abs(xc - PEAK_X) / CLUSTER_HW;
    const mainEnv = mainD < 1 ? (1 - mainD) * (1 - mainD) : 0;
    const leftD = Math.abs(xc - LEFT_TAIL_X) / LEFT_TAIL_HW;
    const leftEnv = leftD < 1 ? (1 - leftD) * (1 - leftD) * 0.38 : 0;
    const useLeftTail = leftEnv > mainEnv;

    for (let row = 0; row < ROWS; row++) {
      const y0 = (row * VIEW_H) / ROWS;
      const y1 = ((row + 1) * VIEW_H) / ROWS;
      const yc = (y0 + y1) / 2;
      const hw = ((rowFactor(xc, yc, useLeftTail) * colPitch) / 2) * envelope;

      if (hw < 0.02) continue;

      shapes.push(
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

  return shapes;
}

export function LandingHeroOpArt() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        {buildPattern()}
      </svg>
    </div>
  );
}
