import { SOCIAL_PROOF_AVATARS } from "@/lib/landing-content";

const STATS = [
  { value: "< 60s", label: "Average report time" },
  { value: "3", label: "Report sections" },
  { value: "0", label: "Setup required" },
] as const;

export function TestSocialProofSection() {
  return (
    <section className="px-5 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-[1040px] overflow-hidden rounded-[32px] bg-[#0E1B36] px-6 py-12 md:px-12 md:py-16">
        <div className="grid items-center gap-10 md:grid-cols-[1.2fr_0.8fr] md:gap-14">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {SOCIAL_PROOF_AVATARS.map((src, i) => (
                  <div
                    key={src}
                    className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-[#0E1B36] bg-[#1A2D4D] ring-1 ring-white/10"
                    style={{ zIndex: SOCIAL_PROOF_AVATARS.length - i }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      width={40}
                      height={40}
                      className="block h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ))}
              </div>
              <p className="text-[14px] font-medium text-white/70">
                Used by designers, founders and product teams
              </p>
            </div>

            <blockquote className="mt-8 text-[28px] font-semibold leading-[1.15] tracking-[-0.04em] text-white md:text-[36px]">
              &ldquo;The fastest way to spot UX problems before launch.&rdquo;
            </blockquote>
          </div>

          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[20px] border border-white/10 bg-white/5 px-3 py-4 text-center md:px-4 md:py-5"
              >
                <div className="text-[22px] font-semibold tracking-[-0.03em] text-white md:text-[28px]">
                  {stat.value}
                </div>
                <div className="mt-1 text-[11px] leading-tight text-white/60 md:text-[12px]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
