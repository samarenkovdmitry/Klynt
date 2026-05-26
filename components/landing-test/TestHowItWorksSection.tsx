import { RiArrowRightLine, RiLinkM } from "@remixicon/react";

import { Button } from "@/components/ui/Button";
import { LANDING_BUTTON_CLASS } from "@/components/landing/landingStyles";
import { TEST_HOW_IT_WORKS_STEPS } from "@/lib/landing-test-content";

import { TestSectionEyebrow } from "./TestSectionEyebrow";
import { TEST_CONTAINER, TEST_HEADLINE, TEST_SECTION, TEST_SUBCOPY } from "./testStyles";

function StepVisual({ stepIndex }: { stepIndex: number }) {
  if (stepIndex === 0) {
    return (
      <div className="rounded-[24px] border border-[rgba(6,28,47,0.08)] bg-white p-5 shadow-[0_16px_48px_rgba(6,28,47,0.08)]">
        <div className="flex items-center gap-2 rounded-xl border border-[rgba(6,28,47,0.08)] bg-[#F5F7FA] px-4 py-3">
          <RiLinkM size={18} className="shrink-0 text-[#2563EB]" />
          <span className="truncate text-[14px] text-[#6B7280]">
            https://your-landing-page.com
          </span>
        </div>
        <div className="mt-4 flex justify-end">
          <span className="rounded-full bg-[#2563EB] px-4 py-2 text-[13px] font-semibold text-white">
            Analyze
          </span>
        </div>
      </div>
    );
  }

  if (stepIndex === 1) {
    return (
      <div className="rounded-[24px] border border-[rgba(6,28,47,0.08)] bg-[#0E1B36] p-5 shadow-[0_16px_48px_rgba(6,28,47,0.12)]">
        <div className="flex items-center justify-between text-[12px] text-white/60">
          <span>Scanning page</span>
          <span className="text-[#10a6da]">Live</span>
        </div>
        <div className="mt-4 space-y-2.5">
          {["Hero clarity", "Trust signals", "CTA hierarchy"].map((label, i) => (
            <div key={label} className="flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#2563EB]"
                  style={{ width: `${88 - i * 18}%` }}
                />
              </div>
              <span className="w-24 text-right text-[11px] text-white/70">{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-[rgba(6,28,47,0.08)] bg-white p-5 shadow-[0_16px_48px_rgba(6,28,47,0.08)]">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[#061C2F]">Clarity Report</span>
        <span className="rounded-full bg-[#E8F7EE] px-2.5 py-0.5 text-[11px] font-semibold text-[#2E7D4F]">
          Score 76
        </span>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-2 w-full rounded-full bg-[#E5E7EB]" />
        <div className="h-2 w-[70%] rounded-full bg-[#E5E7EB]" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {["UX", "Copy", "Fixes"].map((tag) => (
          <div
            key={tag}
            className="rounded-lg bg-[#F5F7FA] py-2 text-center text-[11px] font-medium text-[#6B7280]"
          >
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TestHowItWorksSection() {
  return (
    <section className={`${TEST_SECTION} bg-[#F5F7FA]`}>
      <div className={TEST_CONTAINER}>
        <div className="max-w-[640px]">
          <TestSectionEyebrow index="01" label="How it works" />
          <h2 className={`mt-4 ${TEST_HEADLINE}`}>
            Paste a URL. Get a clarity report.
          </h2>
          <p className={`mt-4 ${TEST_SUBCOPY}`}>
            No setup. No signup. Results in under a minute.
          </p>
        </div>

        <div className="mt-14 space-y-16 md:mt-20 md:space-y-24">
          {TEST_HOW_IT_WORKS_STEPS.map((step, index) => {
            const reversed = index % 2 === 1;

            return (
              <article
                key={step.title}
                className={`grid items-center gap-10 md:grid-cols-2 md:gap-16 ${reversed ? "md:[&>*:first-child]:order-2" : ""}`}
              >
                <div>
                  <div className="text-[48px] font-semibold leading-none tracking-[-0.04em] text-[#2563EB]/20 md:text-[64px]">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-3 text-[24px] font-semibold tracking-[-0.03em] text-[#061C2F] md:text-[28px]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[16px] leading-7 text-[#6B7280]">
                    {step.description}
                  </p>
                  <ul className="mt-5 space-y-2">
                    {step.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2 text-[14px] leading-6 text-[#6B7280]"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563EB]" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>

                <StepVisual stepIndex={index} />
              </article>
            );
          })}
        </div>

        <div className="mt-14 flex justify-center md:mt-16">
          <Button
            href="/analyze"
            icon={<RiArrowRightLine size={18} />}
            fullWidth={false}
            className={LANDING_BUTTON_CLASS}
          >
            Start free audit
          </Button>
        </div>
      </div>
    </section>
  );
}
