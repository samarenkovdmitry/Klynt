export function LandingPageAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-x-0 top-0 h-[100vh]"
        style={{
          background:
            "radial-gradient(ellipse 90% 58% at 62% 16%, rgba(99, 102, 241, 0.30) 0%, rgba(79, 70, 229, 0.14) 38%, rgba(79, 70, 229, 0.05) 58%, transparent 74%)",
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-[100vh]"
        style={{
          background:
            "radial-gradient(ellipse 52% 48% at 12% 32%, rgba(99, 102, 241, 0.10) 0%, transparent 68%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[45vh]"
        style={{
          background:
            "radial-gradient(ellipse 95% 75% at 50% 100%, rgba(124, 58, 237, 0.12) 0%, rgba(124, 58, 237, 0.03) 42%, transparent 72%)",
        }}
      />
    </div>
  );
}
