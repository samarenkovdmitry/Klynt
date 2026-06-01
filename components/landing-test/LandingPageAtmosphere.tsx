export function LandingPageAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute -right-[4%] top-[-4%] h-[min(820px,95vw)] w-[min(820px,95vw)] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(79, 70, 229, 0.26) 0%, rgba(79, 70, 229, 0.08) 42%, transparent 70%)",
        }}
      />
      <div
        className="absolute -left-[8%] top-[4%] h-[min(480px,65vw)] w-[min(480px,65vw)] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, rgba(99, 102, 241, 0.04) 48%, transparent 72%)",
        }}
      />
      <div
        className="absolute bottom-[-6%] left-1/2 h-[min(680px,105vw)] w-[min(980px,145vw)] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(124, 58, 237, 0.14) 0%, rgba(124, 58, 237, 0.04) 38%, transparent 66%)",
        }}
      />
    </div>
  );
}
