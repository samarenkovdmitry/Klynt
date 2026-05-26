import {
  LANDING_UPDATE_CONTAINER,
  THREE_LENSES,
} from "@/lib/landing-update-content";

import { UPDATE_HEADLINE, UPDATE_SECTION, UPDATE_SUBCOPY } from "./landingUpdateStyles";

export function LandingUpdateThreeLenses() {
  return (
    <section className={`${UPDATE_SECTION} bg-[#F5F7FA]`}>
      <div className={LANDING_UPDATE_CONTAINER}>
        <div className="mx-auto max-w-[720px] text-center">
          <h2 className={UPDATE_HEADLINE}>One score. Three lenses.</h2>
          <p className={`mx-auto mt-5 max-w-[620px] ${UPDATE_SUBCOPY}`}>
            Every audit breaks your page into what&apos;s wrong, what to fix,
            and how to rewrite the copy.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-4 gap-8">
          {THREE_LENSES.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#2563EB]/10 text-[#2563EB]">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 text-[16px] font-semibold tracking-[-0.02em] text-[#061C2F]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[14px] leading-6 text-[#6B7280]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
