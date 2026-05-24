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
        {/* Top-left */}
        <path
          d="M0 26 Q0 0 26 0 L292 0 L0 278 Z"
          fill="#D4F2FC"
          fillOpacity={0.52}
        />

        {/* Top-right */}
        <path
          d="M1414 0 Q1440 0 1440 26 L1440 268 L1162 0 Z"
          fill="#B8E8F8"
          fillOpacity={0.48}
        />

        {/* Top-center — points down */}
        <path
          d="M608 0 L832 0 L720 76 Q718 80 716 76 Z"
          fill="#FFFFFF"
          fillOpacity={0.1}
        />

        {/* Left — points right */}
        <path
          d="M0 396 Q0 378 14 382 L98 450 L14 518 Q0 522 0 504 L0 396 Z"
          fill="#0F7FB3"
          fillOpacity={0.11}
        />

        {/* Right — points left */}
        <path
          d="M1440 384 Q1440 366 1426 370 L1342 448 L1426 526 Q1440 530 1440 512 L1440 384 Z"
          fill="#FFFFFF"
          fillOpacity={0.12}
        />

        {/* Bottom-left */}
        <path
          d="M0 874 Q0 900 26 900 L348 900 L0 598 Z"
          fill="#0B6FA0"
          fillOpacity={0.1}
        />

        {/* Bottom-right */}
        <path
          d="M1440 874 Q1440 900 1414 900 L1068 900 L1440 588 Z"
          fill="#D4F2FC"
          fillOpacity={0.42}
        />

        {/* Bottom-center — points up */}
        <path
          d="M564 900 L876 900 L720 824 Q718 820 716 824 Z"
          fill="#B8E8F8"
          fillOpacity={0.28}
        />
      </svg>
    </div>
  );
}
