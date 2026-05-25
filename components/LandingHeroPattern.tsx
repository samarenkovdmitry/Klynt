export function LandingHeroPattern() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-pattern.png"
        alt=""
        className="absolute right-0 top-0 h-full w-auto"
      />
    </div>
  );
}
