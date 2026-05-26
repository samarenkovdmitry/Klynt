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

function columnHalfWidths(xc: number, colPitch: number, envelope: number): number[] {
  const hws: number[] = [];

  for (let row = 0; row < ROWS; row++) {
    const y0 = (row * VIEW_H) / ROWS;
    const y1 = ((row + 1) * VIEW_H) / ROWS;
    const yc = (y0 + y1) / 2;
    hws.push(((sphereFactor(xc, yc) * colPitch) / 2) * envelope);
  }

  return hws;
}

function columnPathD(xc: number, hws: number[]): string {
  const rowH = VIEW_H / ROWS;
  const pts: Array<[number, number]> = [];

  pts.push([xc - hws[0], 0], [xc + hws[0], 0]);

  for (let i = 0; i < ROWS - 1; i++) {
    const y = (i + 1) * rowH;
    pts.push([xc + hws[i], y], [xc + hws[i + 1], y]);
  }

  pts.push([xc + hws[ROWS - 1], VIEW_H], [xc - hws[ROWS - 1], VIEW_H]);

  for (let i = ROWS - 2; i >= 0; i--) {
    const y = (i + 1) * rowH;
    pts.push([xc - hws[i + 1], y], [xc - hws[i], y]);
  }

  const [first, ...rest] = pts;
  return `M ${first[0]},${first[1]} ${rest.map(([x, y]) => `L ${x},${y}`).join(" ")} Z`;
}

function buildPaths() {
  const colPitch = VIEW_W / COLS;
  const paths = [];

  for (let col = 0; col < COLS; col++) {
    const xc = (col + 0.5) * colPitch;
    const envelope = columnEnvelope(xc);
    if (envelope <= 0) continue;

    const hws = columnHalfWidths(xc, colPitch, envelope);
    if (Math.max(...hws) < 0.02) continue;

    paths.push(
      <path
        key={col}
        d={columnPathD(xc, hws)}
        fill={FILL}
      />
    );
  }

  return paths;
}

function OpArtSvg({
  className,
  viewBox,
  preserveAspectRatio,
}: {
  className: string;
  viewBox: string;
  preserveAspectRatio: string;
}) {
  return (
    <svg
      className={className}
      viewBox={viewBox}
      preserveAspectRatio={preserveAspectRatio}
      shapeRendering="geometricPrecision"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      {buildPaths()}
    </svg>
  );
}

export function LandingHeroOpArt() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <OpArtSvg
        className="absolute left-[calc(50%+220px)] top-0 h-full w-auto max-w-none -translate-x-1/2 md:left-[calc(50%+400px)]"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
}

export function LandingCtaOpArt() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <OpArtSvg
        className="absolute right-0 top-0 h-full w-[34%] min-w-[130px] max-w-[280px] md:w-[30%] md:max-w-[320px]"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMaxYMid meet"
      />
    </div>
  );
}
