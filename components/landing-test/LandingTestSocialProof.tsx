import { SOCIAL_PROOF_AVATARS } from "@/lib/landing-content";
import { LANDING_UPDATE_CONTAINER } from "@/lib/landing-update-content";

export function LandingTestSocialProof() {
  return (
    <section className="bg-white px-5 py-[108px] md:px-6 md:py-[200px]">
      <div className={`${LANDING_UPDATE_CONTAINER} text-center`}>
        <h2 className="mx-auto max-w-[860px] text-[40px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#061C2F] md:text-[44px] md:leading-[1.02]">
          Clarity problems are obvious once{" "}
          <span className="text-[#2563EB]">you see them.</span>
        </h2>

        <p className="mb-20 mt-4 text-[16px] font-semibold text-[#6B7280] md:mt-5 md:text-[17px]">
          Klynt clarity engine
        </p>

        <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:gap-3">
          <div className="flex -space-x-3">
            {SOCIAL_PROOF_AVATARS.map((src, i) => (
              <div
                key={src}
                className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white bg-[#E8F0F5] ring-1 ring-[rgba(6,28,47,0.06)]"
                style={{ zIndex: SOCIAL_PROOF_AVATARS.length - i }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  width={48}
                  height={48}
                  className="block h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
          </div>
          <p className="max-w-[280px] text-[15px] font-normal text-[#8E99A2] md:max-w-none">
            Used by designers, founders and product teams
          </p>
        </div>
      </div>
    </section>
  );
}
