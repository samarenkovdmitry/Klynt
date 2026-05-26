import {
  LANDING_UPDATE_CONTAINER,
  PLATFORM_FEATURES,
} from "@/lib/landing-update-content";

import {
  UPDATE_EYEBROW,
  UPDATE_HEADLINE,
  UPDATE_SECTION,
} from "./landingUpdateStyles";

export function LandingUpdatePlatform() {
  return (
    <section className={`${UPDATE_SECTION} bg-[#0E1B36]`}>
      <div className={LANDING_UPDATE_CONTAINER}>
        <div className="mx-auto max-w-[640px] text-center">
          <p className={UPDATE_EYEBROW}>Platform</p>
          <h2 className={`mt-4 text-white ${UPDATE_HEADLINE}`}>
            Built to make landing clarity obvious
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-5">
          {PLATFORM_FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="rounded-[24px] border border-white/10 bg-[#152544] p-8"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563EB]/15 text-[#2563EB]">
                  <Icon size={20} />
                </div>
                <h3 className="mt-5 text-[22px] font-semibold tracking-[-0.03em] text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[15px] leading-6 text-white/65">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
