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
        {/* Light cyan layer — bottom-left */}
        <path
          d="M-80 520 L420 900 L-80 900 Z"
          fill="#D4F2FC"
          fillOpacity={0.55}
        />
        <path
          d="M0 680 L280 900 L0 900 Z"
          fill="#FFFFFF"
          fillOpacity={0.12}
        />

        {/* Deep teal parallelogram — left edge */}
        <path
          d="M-40 120 L220 120 L120 420 L-140 420 Z"
          fill="#0B6FA0"
          fillOpacity={0.14}
        />

        {/* Large triangle — top-right */}
        <path
          d="M920 0 L1440 0 L1440 380 L1080 0 Z"
          fill="#B8E8F8"
          fillOpacity={0.45}
        />

        {/* Parallelogram — top-right */}
        <path
          d="M1120 -40 L1520 180 L1380 420 L980 200 Z"
          fill="#0F7FB3"
          fillOpacity={0.1}
        />

        {/* Diagonal slash — center-right */}
        <path
          d="M1180 280 L1520 520 L1420 680 L1080 440 Z"
          fill="#FFFFFF"
          fillOpacity={0.14}
        />

        {/* Triangle — bottom-right */}
        <path
          d="M1320 620 L1520 900 L1120 900 Z"
          fill="#0B6FA0"
          fillOpacity={0.08}
        />

        {/* Small accent — mid left */}
        <path
          d="M180 240 L320 240 L250 380 Z"
          fill="#061C2F"
          fillOpacity={0.05}
        />

        {/* Parallelogram — bottom center */}
        <path
          d="M520 720 L880 900 L760 900 L400 720 Z"
          fill="#D4F2FC"
          fillOpacity={0.35}
        />

        {/* Thin diagonal cut — upper center */}
        <path
          d="M640 80 L920 80 L780 220 L500 220 Z"
          fill="#FFFFFF"
          fillOpacity={0.08}
        />
      </svg>
    </div>
  );
}
