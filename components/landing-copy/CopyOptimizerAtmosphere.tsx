export function CopyOptimizerAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-x-0 top-0 h-[100vh]"
        style={{
          background:
            "radial-gradient(ellipse 88% 60% at 58% 14%, rgba(20, 184, 166, 0.34) 0%, rgba(13, 148, 136, 0.16) 36%, rgba(13, 148, 136, 0.05) 58%, transparent 76%)",
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-[100vh]"
        style={{
          background:
            "radial-gradient(ellipse 48% 44% at 14% 28%, rgba(245, 158, 11, 0.18) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
