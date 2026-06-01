export function LandingPageAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute -right-[12%] top-[-6%] h-[min(760px,90vw)] w-[min(760px,90vw)] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(79, 70, 229, 0.16) 0%, rgba(79, 70, 229, 0.04) 45%, transparent 72%)",
        }}
      />
      <div
        className="absolute -left-[10%] top-[6%] h-[min(520px,70vw)] w-[min(520px,70vw)] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.03) 50%, transparent 72%)",
        }}
      />
      <div
        className="absolute bottom-[-8%] left-1/2 h-[min(640px,100vw)] w-[min(960px,140vw)] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(124, 58, 237, 0.08) 0%, rgba(124, 58, 237, 0.02) 40%, transparent 68%)",
        }}
      />
    </div>
  );
}
