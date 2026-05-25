export function LandingHeroPattern() {
  return (
    <>
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/pattern.svg"
          alt=""
          className="
            pointer-events-none
            absolute
            right-[-10%]
            top-0
            h-[120%]
            w-auto
            select-none
            opacity-[0.18]
          "
        />
      </div>

      <div
        className="
          pointer-events-none
          absolute
          right-[-200px]
          top-[-200px]
          h-[700px]
          w-[700px]
          rounded-full
          bg-[#2F6FED]
          opacity-[0.08]
          blur-3xl
        "
        aria-hidden
      />
    </>
  );
}
