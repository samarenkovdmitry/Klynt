import { RiArrowRightLine, RiImageAddLine, RiLinkM } from "@remixicon/react";

import { Button } from "@/components/ui/Button";
import { TrustBadgeRow } from "@/components/TrustBadgeRow";
import { LANDING_BUTTON_CLASS } from "@/components/landing/landingStyles";
import {
  LANDING_UPDATE_CONTAINER,
  PROCESS_STEPS,
} from "@/lib/landing-update-content";

import {
  UPDATE_SECTION,
  UPDATE_SECTION_DESC,
  UPDATE_SECTION_LABEL,
  UPDATE_SECTION_TITLE,
} from "./landingUpdateStyles";

const stepVisualShell =
  "flex h-[220px] items-center justify-center rounded-[24px] bg-[#CBD9F7] px-5 py-5 md:h-[400px] md:rounded-[28px] md:px-10 md:py-10";

const stepVisualShellReview =
  "flex h-[248px] items-center justify-center rounded-[24px] bg-[#CBD9F7] px-5 py-5 md:h-[400px] md:rounded-[28px] md:px-10 md:py-10";

const stepCardClass =
  "w-full max-w-[380px] rounded-[20px] bg-white p-5 shadow-[0_16px_48px_rgba(6,28,47,0.08)]";

function ReviewReportScoreRing() {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const scoreColor = "#10B981";

  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg
        className="absolute inset-0 h-full w-full -rotate-90"
        viewBox="0 0 80 80"
        aria-hidden
      >
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="#E5E7EB"
          strokeWidth="4"
          fill="transparent"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke={scoreColor}
          strokeWidth="4"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.25}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-[29px] font-semibold"
        style={{ color: scoreColor }}
      >
        75
      </span>
    </div>
  );
}

function StepVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className={stepVisualShell}>
        <div className={stepCardClass}>
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
      <div className={stepVisualShell}>
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
    <div className={stepVisualShellReview}>
      <div className={stepCardClass}>
        <div className="flex items-center justify-between text-[14px]">
          <span className="font-semibold text-[#061C2F]">Clarity Report</span>
          <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
            <span>Export PDF</span>
            <span className="h-4 w-px bg-[#EBEFF3]" aria-hidden />
            <span>Share</span>
          </div>
        </div>
        <div className="mt-5 flex items-stretch gap-4">
          <ReviewReportScoreRing />
          <div className="flex min-w-0 flex-1 items-stretch gap-3">
            <div className="flex flex-1 flex-col justify-center gap-2">
              <div className="h-2 w-full rounded-full bg-[#E5E7EB]" />
              <div className="h-2 w-[80%] rounded-full bg-[#E5E7EB]" />
            </div>
            <div className="space-y-2">
              <div className="h-1.5 w-16 rounded-full bg-[#E5E7EB]" />
              <div className="h-1.5 w-14 rounded-full bg-[#E5E7EB]" />
              <div className="h-1.5 w-12 rounded-full bg-[#E5E7EB]" />
              <div className="h-1.5 w-10 rounded-full bg-[#E5E7EB]" />
              <div className="h-1.5 w-8 rounded-full bg-[#E5E7EB]" />
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-1 md:gap-2">
          {["UX Issues", "Improvements", "Copy Refinement"].map((tag) => (
            <span
              key={tag}
              className="flex items-center justify-center rounded-lg bg-[#F5F7FA] px-2 py-1.5 text-center text-[11px] font-medium text-[#6B7280]"
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
    <section className={`${UPDATE_SECTION} bg-[#F5F7FA]`}>
      <div className={LANDING_UPDATE_CONTAINER}>
        <div className="mx-auto max-w-[760px] text-center">
          <p className={UPDATE_SECTION_LABEL}>How it works</p>
          <h2 className={UPDATE_SECTION_TITLE}>Paste a URL. Get a clarity report.</h2>
          <p className={UPDATE_SECTION_DESC}>
            No setup. No signup. Results in under a minute.
          </p>
        </div>

        <div className="mt-12 space-y-8 md:mt-20 md:space-y-24">
          {PROCESS_STEPS.map((step, index) => {
            const reversed = index % 2 === 1;

            return (
              <article
                key={step.title}
                className={`grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-16 ${reversed ? "md:[&>*:first-child]:order-2" : ""}`}
              >
                <div>
                  <div className="text-[28px] font-semibold leading-none tracking-[-0.04em] text-[#2563EB]">
                    {index + 1}
                  </div>
                  <h3 className="mt-4 text-[22px] font-semibold tracking-[-0.03em] text-[#061C2F] md:text-[28px]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[16px] leading-7 text-[#6B7280]">
                    {step.description}
                  </p>
                  <ul className="mt-5 space-y-2">
                    {step.bullets.map((bullet) => {
                      const Icon = bullet.icon;

                      return (
                        <li
                          key={bullet.text}
                          className="flex items-center gap-3 text-[14px] leading-6 text-[#6B7280]"
                        >
                          <Icon size={18} className="shrink-0 text-[#2563EB]" />
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
    <section className="bg-[#F5F7FA] px-5 pb-16 pt-4 md:px-6 md:pb-24">
      <div className="mx-auto flex max-w-[1040px] flex-col items-center">
        <Button
          href="/analyze"
          icon={<RiArrowRightLine size={18} />}
          fullWidth={false}
          className={`${LANDING_BUTTON_CLASS} w-[302px]`}
        >
          Start free audit
        </Button>
        <TrustBadgeRow variant="light" gray className="mt-5" />
      </div>
    </section>
  );
}
