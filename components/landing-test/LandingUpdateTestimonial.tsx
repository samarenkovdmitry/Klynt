import { SOCIAL_PROOF_AVATARS } from "@/lib/landing-content";
import { LANDING_UPDATE_CONTAINER } from "@/lib/landing-update-content";

import { UPDATE_SECTION } from "./landingUpdateStyles";

export function LandingUpdateTestimonial() {
  return (
    <section className={`${UPDATE_SECTION} bg-white`}>
      <div className={`${LANDING_UPDATE_CONTAINER} text-center`}>
        <blockquote className="mx-auto max-w-[760px] text-[40px] font-semibold leading-[1.1] tracking-[-0.04em] text-[#061C2F]">
          &ldquo;Like a senior UX review in two minutes.&rdquo;
        </blockquote>

        <div className="mt-10 flex justify-center -space-x-3">
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

        <p className="mt-6 text-[17px] font-medium text-[#2563EB]">
          Used by designers, founders and product teams
        </p>
      </div>
    </section>
  );
}
