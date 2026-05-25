type Triangle = {
  left: number;
  top: number;
  height: number;
  width: number;
};

const PATTERN_FILL = "#14254A";
const VIEW_W = 478;
const VIEW_H = 832;

function trianglePoints(
  left: number,
  top: number,
  height: number,
  width: number
): string {
  const tipX = left + width;
  const tipY = top + height / 2;
  return `${left},${top} ${left},${top + height} ${tipX},${tipY}`;
}

/**
 * Fractal columns: each step halves height and width (matches reference asset).
 * Right column = largest; tips touch the previous column’s vertical edge.
 */
function buildTriangles(): Triangle[] {
  const triangles: Triangle[] = [];
  let edgeX = VIEW_W;

  for (let col = 0; col < 12; col++) {
    const height = VIEW_H / Math.pow(2, col);
    if (height < 4) break;

    const width = VIEW_W / Math.pow(2, col + 1);
    const left = edgeX - width;
    const count = Math.pow(2, col);

    for (let i = 0; i < count; i++) {
      triangles.push({
        left,
        top: i * height,
        height,
        width,
      });
    }

    edgeX = left;
    if (edgeX <= 0) break;
  }

  return triangles;
}

const TRIANGLES = buildTriangles();

export function LandingHeroPattern() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <svg
        className="absolute right-0 top-0 h-full w-auto"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMaxYMin meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {TRIANGLES.map((tri, index) => (
          <polygon
            key={index}
            points={trianglePoints(tri.left, tri.top, tri.height, tri.width)}
            fill={PATTERN_FILL}
          />
        ))}
      </svg>
    </div>
  );
}
