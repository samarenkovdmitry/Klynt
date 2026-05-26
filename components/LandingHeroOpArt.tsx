export function LandingHeroOpArt() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-bg.svg"
        alt=""
        className="h-full w-full object-fill"
      />
    </div>
  );
}
