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

        {/* Staggered horizontal bands — motion blur on X only */}
        <g filter="url(#hero-motion-blur)">
          <rect
            x={-120}
            y={48}
            width={820}
            height={128}
            rx={4}
            fill="#D4F2FC"
            fillOpacity={0.9}
          />
          <rect
            x={520}
            y={148}
            width={1040}
            height={112}
            rx={4}
            fill="#FFFFFF"
            fillOpacity={0.42}
          />
          <rect
            x={-80}
            y={248}
            width={760}
            height={120}
            fill="#B8E8F8"
            fillOpacity={0.85}
          />
          <rect
            x={420}
            y={358}
            width={1120}
            height={136}
            rx={4}
            fill="#3AA8D8"
            fillOpacity={0.55}
          />
          <rect
            x={-100}
            y={488}
            width={680}
            height={108}
            fill="#E8F6FC"
            fillOpacity={0.75}
          />
          <rect
            x={640}
            y={588}
            width={920}
            height={124}
            rx={4}
            fill="#0B6FA0"
            fillOpacity={0.22}
          />
          <rect
            x={80}
            y={708}
            width={880}
            height={118}
            fill="#FFFFFF"
            fillOpacity={0.28}
          />
        </g>

        {/* Soft accent streaks — lighter blur for depth */}
        <g filter="url(#hero-motion-blur-soft)">
          <rect
            x={280}
            y={108}
            width={640}
            height={72}
            fill="#0F7FB3"
            fillOpacity={0.12}
          />
          <rect
            x={-60}
            y={428}
            width={520}
            height={64}
            fill="#061C2F"
            fillOpacity={0.06}
          />
          <rect
            x={900}
            y={668}
            width={620}
            height={80}
            fill="#D4F2FC"
            fillOpacity={0.5}
          />
        </g>
      </svg>
    </div>
  );
}
