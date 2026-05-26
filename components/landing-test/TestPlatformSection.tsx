import { TEST_PLATFORM_FEATURES } from "@/lib/landing-test-content";

import { TestSectionEyebrow } from "./TestSectionEyebrow";
import { TEST_CONTAINER, TEST_HEADLINE, TEST_SECTION } from "./testStyles";

export function TestPlatformSection() {
  return (
    <section className={`${TEST_SECTION} bg-white`}>
      <div className={TEST_CONTAINER}>
        <div className="mx-auto max-w-[640px] text-center">
          <TestSectionEyebrow index="02" label="Platform" />
          <h2 className={`mt-4 ${TEST_HEADLINE}`}>
            Built to make landing clarity obvious
          </h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 md:mt-16 md:gap-5">
          {TEST_PLATFORM_FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="group rounded-[24px] border border-[rgba(6,28,47,0.06)] bg-[#FAFBFC] p-6 transition-shadow duration-200 hover:shadow-[0_12px_40px_rgba(6,28,47,0.06)] md:p-8"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB] transition-colors group-hover:bg-[#2563EB]/15">
                  <Icon size={20} />
                </div>
                <h3 className="mt-5 text-[20px] font-semibold tracking-[-0.03em] text-[#061C2F]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[15px] leading-6 text-[#6B7280]">
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
