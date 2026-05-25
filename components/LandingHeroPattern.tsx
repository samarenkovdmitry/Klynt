type Triangle = {
  left: number;
  top: number;
  width: number;
  height: number;
};

const PATTERN_FILL = "#14254A";

/** Right-pointing chevron; top edge flush with `top`. */
function trianglePoints(left: number, top: number, width: number, height: number) {
  const tipX = left + width;
  const tipY = top + height / 2;
  return `${left},${top} ${left},${top + height} ${tipX},${tipY}`;
}

/** Columns widen left → right; tops aligned to y = 0. */
const TRIANGLES: Triangle[] = [
  { left: 165, top: 0, width: 58, height: 320 },
  { left: 235, top: 0, width: 95, height: 480 },
  { left: 330, top: 0, width: 140, height: 640 },
  { left: 450, top: 0, width: 320, height: 800 },
];

export function LandingHeroPattern() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <svg
        className="absolute right-0 top-0 h-full w-[46%] min-w-[280px] max-w-[640px]"
        viewBox="0 0 520 800"
        preserveAspectRatio="xMaxYMin slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {TRIANGLES.map((tri, index) => (
          <polygon
            key={index}
            points={trianglePoints(tri.left, tri.top, tri.width, tri.height)}
            fill={PATTERN_FILL}
          />
        ))}
      </svg>
    </div>
  );
}
