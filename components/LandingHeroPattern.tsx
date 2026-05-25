const PATTERN_WIDTH = 512;
const PATTERN_HEIGHT = 512;

export function LandingHeroPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/pattern.svg"
        alt=""
        width={PATTERN_WIDTH}
        height={PATTERN_HEIGHT}
        className="
          pointer-events-none
          absolute
          top-0
          left-[48%]
          max-w-none
          shrink-0
          select-none
          opacity-[0.18]
        "
        style={{
          width: PATTERN_WIDTH,
          height: PATTERN_HEIGHT,
          minWidth: PATTERN_WIDTH,
          minHeight: PATTERN_HEIGHT,
        }}
      />
    </div>
  );
}
