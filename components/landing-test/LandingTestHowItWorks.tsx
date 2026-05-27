import {
  RiAdvertisementLine,
  RiArrowRightLine,
  RiImageAddLine,
  RiLinkM,
} from "@remixicon/react";

import { Button } from "@/components/ui/Button";
import { TrustBadgeRow } from "@/components/TrustBadgeRow";
import { LANDING_BUTTON_CLASS } from "@/components/landing/landingStyles";
import { PROCESS_STEPS, TEST_CONTAINER } from "@/lib/landing-update-content";

import { TestSectionHeader } from "./TestSectionHeader";
import { TEST_SECTION, TEST_STEP_PANEL } from "./landingUpdateStyles";

function StepVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className={`flex h-[320px] items-center justify-center p-8 ${TEST_STEP_PANEL}`}>
        <div className="w-full max-w-[380px] rounded-[20px] border border-[rgba(6,28,47,0.06)] bg-white p-5 shadow-[0_16px_48px_rgba(6,28,47,0.08)]">
          <div className="flex items-center gap-2 rounded-xl border border-[rgba(6,28,47,0.08)] bg-[#F5F7FA] px-4 py-3">
            <RiLinkM size={18} className="shrink-0 text-[#2563EB]" />
            <span className="truncate text-[14px] text-[#6B7280]">
              https://your-landing-page.com
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 text-[13px] text-[#6B7280]">
              <RiImageAddLine size={16} />
              or upload a screenshot
            </span>
            <span className="rounded-full bg-[#2563EB] px-5 py-2.5 text-[14px] font-semibold text-white">
              Analyze
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className={`flex h-[320px] items-center justify-center p-8 ${TEST_STEP_PANEL}`}>
        <div className="w-full max-w-[380px] rounded-[20px] bg-[#0E1B36] p-5 shadow-[0_16px_48px_rgba(6,28,47,0.12)]">
          <div className="flex items-center justify-between text-[12px] text-white/60">
            <span>Scanning page</span>
            <span className="inline-flex items-center gap-1.5 text-[#10a6da]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10a6da]" />
              Processing
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {[
              ["Hero clarity", "88%"],
              ["Trust signals", "70%"],
              ["CTA hierarchy", "52%"],
            ].map(([label, width]) => (
              <div key={label} className="flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#2563EB]"
                    style={{ width }}
                  />
                </div>
                <span className="w-24 text-right text-[11px] text-white/70">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-[320px] items-center justify-center p-8 ${TEST_STEP_PANEL}`}>
      <div className="w-full max-w-[380px] rounded-[20px] border border-[rgba(6,28,47,0.06)] bg-white p-5 shadow-[0_16px_48px_rgba(6,28,47,0.08)]">
        <div className="flex items-center justify-between text-[14px]">
          <span className="font-semibold text-[#061C2F]">Clarity Report</span>
          <div className="flex gap-4 text-[13px] text-[#6B7280]">
            <span>Export PDF</span>
            <span>Share</span>
          </div>
        </div>
        <div className="mt-5 flex items-start gap-4">
          <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border-[6px] border-[#F59E0B] text-[22px] font-semibold text-[#F59E0B]">
            75
          </div>
          <div className="flex-1 space-y-2 pt-2">
            <div className="h-2 w-full rounded-full bg-[#E5E7EB]" />
            <div className="h-2 w-[80%] rounded-full bg-[#E5E7EB]" />
            <div className="h-2 w-[60%] rounded-full bg-[#E5E7EB]" />
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-2 w-16 rounded-full bg-[#E5E7EB]" />
            <div className="h-2 w-12 rounded-full bg-[#E5E7EB]" />
            <div className="h-2 w-14 rounded-full bg-[#E5E7EB]" />
            <div className="h-2 w-10 rounded-full bg-[#E5E7EB]" />
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          {["UX Issues", "Improvements", "Copy Refinement"].map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#F5F7FA] px-3 py-1.5 text-[11px] font-medium text-[#6B7280]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LandingTestHowItWorks() {
  return (
    <section className={`${TEST_SECTION} bg-[#F5F7FA]`}>
      <div className={TEST_CONTAINER}>
        <TestSectionHeader
          eyebrow="How it works"
          title="Paste a URL. Get a clarity report."
          description="No setup. No signup. Results in under a minute."
        />

        <div className="mt-20 space-y-24">
          {PROCESS_STEPS.map((step, index) => {
            const reversed = index % 2 === 1;

            return (
              <article
                key={step.title}
                className={`grid grid-cols-2 items-center gap-16 ${reversed ? "[&>*:first-child]:order-2" : ""}`}
              >
                <div>
                  <div className="text-[64px] font-semibold leading-none tracking-[-0.04em] text-[#2563EB]">
                    {index + 1}
                  </div>
                  <h3 className="mt-4 text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#061C2F]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[16px] leading-7 text-[#6B7280]">
                    {step.description}
                  </p>
                  <ul className="mt-5 space-y-3">
                    {step.bullets.map((bullet) => {
                      const Icon = bullet.icon;

                      return (
                        <li
                          key={bullet.text}
                          className="flex items-center gap-3 text-[14px] leading-6 text-[#6B7280]"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2563EB]/10 text-[#2563EB]">
                            <Icon size={16} />
                          </span>
                          {bullet.text}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <StepVisual index={index} />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function LandingTestMidCta() {
  return (
    <section className="bg-[#F5F7FA] px-6 pb-[100px] pt-2">
      <div className="mx-auto flex max-w-[1040px] flex-col items-center">
        <Button
          href="/analyze"
          icon={<RiArrowRightLine size={18} />}
          fullWidth={false}
          className={LANDING_BUTTON_CLASS}
        >
          Start free audit
        </Button>
        <TrustBadgeRow variant="light" className="mt-5" />
      </div>
    </section>
  );
}
