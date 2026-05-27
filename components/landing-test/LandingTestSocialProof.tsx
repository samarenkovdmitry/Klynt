import { SOCIAL_PROOF_AVATARS } from "@/lib/landing-content";
import { LANDING_UPDATE_CONTAINER } from "@/lib/landing-update-content";

import { UPDATE_SECTION } from "./landingUpdateStyles";

export function LandingTestSocialProof() {
  return (
    <section className={`${UPDATE_SECTION} bg-white`}>
      <div className={`${LANDING_UPDATE_CONTAINER} text-center`}>
        <h2 className="mx-auto max-w-[860px] text-[32px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#061C2F] md:text-[52px] md:leading-[1.02]">
          Clarity problems are obvious once{" "}
          <span className="text-[#2563EB]">you see them.</span>
        </h2>

        <p className="mt-4 text-[16px] text-[#6B7280] md:mt-5 md:text-[17px]">
          Klynt clarity engine
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 md:mt-10 md:flex-row md:gap-3">
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
          <p className="max-w-[280px] text-[14px] font-medium text-[#2563EB] md:max-w-none md:text-[15px]">
            Used by designers, founders and product teams
          </p>
        </div>
      </div>
    </section>
  );
}
