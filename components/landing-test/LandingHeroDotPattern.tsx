/** Subtle dot grid for hero atmosphere — low contrast, fades at edges. */
export function LandingHeroDotPattern() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
        maskImage:
          "radial-gradient(ellipse 85% 72% at 50% 38%, black 28%, transparent 78%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 85% 72% at 50% 38%, black 28%, transparent 78%)",
      }}
    />
  );
}
