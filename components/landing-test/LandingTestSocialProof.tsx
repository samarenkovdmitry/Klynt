import { SOCIAL_PROOF_AVATARS } from "@/lib/landing-content";
import { TEST_CONTAINER } from "@/lib/landing-update-content";

import { TEST_HEADLINE, TEST_SECTION } from "./landingUpdateStyles";

export function LandingTestSocialProof() {
  return (
    <section className={`${TEST_SECTION} bg-white`}>
      <div className={`${TEST_CONTAINER} text-center`}>
        <h2 className={`mx-auto max-w-[860px] ${TEST_HEADLINE}`}>
          Clarity problems are obvious once{" "}
          <span className="text-[#2563EB]">you see them.</span>
        </h2>

        <p className="mt-5 text-[17px] text-[#6B7280]">Klynt clarity engine</p>

        <div className="mt-10 flex items-center justify-center gap-3">
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
          <p className="text-[15px] font-medium text-[#2563EB]">
            Used by designers, founders and product teams
          </p>
        </div>
      </div>
    </section>
  );
}
