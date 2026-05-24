export function LandingHeroPattern() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter
            id="hero-motion-blur"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="36 0" />
          </filter>
          <filter
            id="hero-motion-blur-soft"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="22 0" />
          </filter>
        </defs>

        <g filter="url(#hero-motion-blur)">
          <rect
            x={-120}
            y={0}
            width={820}
            height={384}
            rx={4}
            fill="#D4F2FC"
            fillOpacity={0.28}
          />
          <rect
            x={520}
            y={120}
            width={1040}
            height={336}
            rx={4}
            fill="#FFFFFF"
            fillOpacity={0.12}
          />
          <rect
            x={-80}
            y={260}
            width={760}
            height={360}
            fill="#B8E8F8"
            fillOpacity={0.25}
          />
          <rect
            x={420}
            y={400}
            width={1120}
            height={408}
            rx={4}
            fill="#3AA8D8"
            fillOpacity={0.17}
          />
          <rect
            x={-100}
            y={560}
            width={680}
            height={324}
            fill="#E8F6FC"
            fillOpacity={0.22}
          />
          <rect
            x={640}
            y={680}
            width={920}
            height={372}
            rx={4}
            fill="#0B6FA0"
            fillOpacity={0.06}
          />
        </g>

        <g filter="url(#hero-motion-blur-soft)">
          <rect
            x={280}
            y={64}
            width={640}
            height={216}
            fill="#0F7FB3"
            fillOpacity={0.045}
          />
          <rect
            x={900}
            y={520}
            width={620}
            height={240}
            fill="#D4F2FC"
            fillOpacity={0.14}
          />
        </g>
      </svg>
    </div>
  );
}
