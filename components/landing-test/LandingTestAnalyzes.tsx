import { ANALYZE_ITEMS, TEST_CONTAINER } from "@/lib/landing-update-content";

import { TestSectionHeader } from "./TestSectionHeader";
import { TEST_SECTION } from "./landingUpdateStyles";

export function LandingTestAnalyzes() {
  return (
    <section className={`${TEST_SECTION} bg-white`}>
      <div className={TEST_CONTAINER}>
        <TestSectionHeader
          eyebrow="What Klynt analyzes"
          title="Everything that makes a page feel unclear"
          description="From UX friction to weak positioning and confusing copy — Klynt turns landing page problems into actionable fixes."
        />

        <div className="mt-16 grid grid-cols-4 gap-x-8 gap-y-10">
          {ANALYZE_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#2563EB]/10 text-[#2563EB]">
                  <Icon size={18} />
                </div>
                <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.02em] text-[#061C2F]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[14px] leading-[1.45] text-[#6B7280]">
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
