import { SOCIAL_PROOF_AVATARS } from "@/lib/landing-content";

export function TestTrustStrip() {
  return (
    <section className="border-y border-[rgba(6,28,47,0.06)] bg-white px-5 py-8 md:px-6">
      <div className="mx-auto flex max-w-[1040px] flex-col items-center gap-4 md:flex-row md:justify-between">
        <p className="text-[14px] font-medium text-[#6B7280] md:text-[15px]">
          Used by designers, founders and product teams
        </p>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {SOCIAL_PROOF_AVATARS.map((src, i) => (
              <div
                key={src}
                className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-white bg-[#E8F0F5] ring-1 ring-[rgba(6,28,47,0.06)]"
                style={{ zIndex: SOCIAL_PROOF_AVATARS.length - i }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  width={36}
                  height={36}
                  className="block h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
          </div>
          <span className="hidden text-[13px] text-[#6B7280] sm:inline">
            Trusted worldwide
          </span>
        </div>
      </div>
    </section>
  );
}
