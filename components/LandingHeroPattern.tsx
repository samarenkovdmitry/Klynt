export function LandingHeroPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/pattern.svg"
        alt=""
        className="
          pointer-events-none
          absolute
          top-0
          right-0
          h-full
          w-auto
          max-w-none
          select-none
        "
      />
    </div>
  );
}
