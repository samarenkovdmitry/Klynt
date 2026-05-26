export function LandingHeroOpArt() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-bg@2x.png"
        alt=""
        className="h-full w-full object-fill"
        decoding="async"
      />
    </div>
  );
}
