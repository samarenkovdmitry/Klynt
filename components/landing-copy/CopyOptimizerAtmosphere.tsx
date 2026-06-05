export function CopyOptimizerAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-x-0 top-0 h-[100vh]"
        style={{
          background:
            "radial-gradient(ellipse 90% 58% at 62% 16%, rgba(20, 184, 166, 0.28) 0%, rgba(13, 148, 136, 0.14) 38%, rgba(13, 148, 136, 0.05) 58%, transparent 74%)",
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-[100vh]"
        style={{
          background:
            "radial-gradient(ellipse 52% 48% at 12% 32%, rgba(20, 184, 166, 0.10) 0%, transparent 68%)",
        }}
      />
    </div>
  );
}
