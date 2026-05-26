import { RiArrowRightLine, RiLinkM } from "@remixicon/react";

import { Button } from "@/components/ui/Button";
import { LANDING_BUTTON_CLASS } from "@/components/landing/landingStyles";
import {
  LANDING_UPDATE_CONTAINER,
  PROCESS_STEPS,
} from "@/lib/landing-update-content";

import {
  UPDATE_EYEBROW,
  UPDATE_HEADLINE,
  UPDATE_SECTION,
  UPDATE_SUBCOPY,
} from "./landingUpdateStyles";

function StepVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-[28px] bg-[#E8F0FE] p-8">
        <div className="w-full max-w-[360px] rounded-[20px] border border-[rgba(6,28,47,0.06)] bg-white p-5 shadow-[0_16px_48px_rgba(6,28,47,0.08)]">
          <div className="flex items-center gap-2 rounded-xl border border-[rgba(6,28,47,0.08)] bg-[#F5F7FA] px-4 py-3">
            <RiLinkM size={18} className="shrink-0 text-[#2563EB]" />
            <span className="truncate text-[14px] text-[#6B7280]">
              https://your-landing-page.com
            </span>
          </div>
          <div className="mt-4 flex justify-end">
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
      <div className="flex h-[280px] items-center justify-center rounded-[28px] bg-[#E8F0FE] p-8">
        <div className="w-full max-w-[360px] rounded-[20px] bg-[#0E1B36] p-5 shadow-[0_16px_48px_rgba(6,28,47,0.12)]">
          <div className="flex items-center justify-between text-[12px] text-white/60">
            <span>Scanning page</span>
            <span className="text-[#10a6da]">Live</span>
          </div>
          <div className="mt-5 space-y-3">
            {["Hero clarity", "Trust signals", "CTA hierarchy"].map((label, i) => (
              <div key={label} className="flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#2563EB]"
                    style={{ width: `${88 - i * 18}%` }}
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
    <div className="flex h-[280px] items-center justify-center rounded-[28px] bg-[#E8F0FE] p-8">
      <div className="w-full max-w-[360px] rounded-[20px] border border-[rgba(6,28,47,0.06)] bg-white p-5 shadow-[0_16px_48px_rgba(6,28,47,0.08)]">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-semibold text-[#061C2F]">
            Clarity Report
          </span>
          <span className="rounded-full bg-[#E8F7EE] px-2.5 py-0.5 text-[11px] font-semibold text-[#2E7D4F]">
            Score 76
          </span>
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
    </div>
  );
}

export function LandingUpdateHowItWorks() {
  return (
    <section className={`${UPDATE_SECTION} bg-white`}>
      <div className={LANDING_UPDATE_CONTAINER}>
        <div className="max-w-[640px]">
          <p className={UPDATE_EYEBROW}>How it works</p>
          <h2 className={`mt-4 ${UPDATE_HEADLINE}`}>
            Paste a URL. Get a clarity report.
          </h2>
          <p className={`mt-5 ${UPDATE_SUBCOPY}`}>
            No setup. No signup. Results in under a minute.
          </p>
        </div>

        <div className="mt-20 space-y-24">
          {PROCESS_STEPS.map((step, index) => {
            const reversed = index % 2 === 1;

            return (
              <article
                key={step.title}
                className={`grid grid-cols-2 items-center gap-16 ${reversed ? "[&>*:first-child]:order-2" : ""}`}
              >
                <div>
                  <div className="text-[56px] font-semibold leading-none tracking-[-0.04em] text-[#2563EB]/25">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-4 text-[28px] font-semibold tracking-[-0.03em] text-[#061C2F]">
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

                <StepVisual index={index} />
              </article>
            );
          })}
        </div>

        <div className="mt-16 flex justify-center">
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
