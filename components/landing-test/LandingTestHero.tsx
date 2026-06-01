import {
  RiArrowRightLine,
  RiFilePdfLine,
  RiLightbulbLine,
  RiPieChartLine,
} from "@remixicon/react";

import { Button } from "@/components/ui/Button";
import { DEMO_REPORT_PATH } from "@/lib/demo-report";

import { LandingTestHeader } from "./LandingTestHeader";
import { LandingTestMockup } from "./LandingTestMockup";

const OUTCOMES = [
  { icon: RiPieChartLine, label: "UX score breakdown" },
  { icon: RiLightbulbLine, label: "Prioritized fixes" },
  { icon: RiFilePdfLine, label: "Shareable PDF" },
] as const;

const HERO_BUTTON_CLASS =
  "!h-[52px] !min-h-[52px] !rounded-full !px-7 !text-[15px] !font-semibold";

export function LandingTestHero() {
  return (
    <section className="relative overflow-hidden bg-[#12161F]">
      <LandingTestHeader />

      <div className="relative z-10 mx-auto max-w-[1180px] px-5 pb-14 pt-8 md:px-6 md:pb-20 md:pt-12">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12 xl:gap-16">
          <div className="mx-auto max-w-[640px] text-center lg:mx-0 lg:max-w-none lg:text-left">
            <h1 className="max-w-[560px] text-[36px] font-semibold leading-[1.1] tracking-[-0.02em] text-white md:text-[48px] md:leading-[1.06] lg:max-w-none xl:text-[52px]">
              See what first-time visitors don&apos;t understand.
            </h1>

            <p className="mt-4 max-w-[560px] text-[16px] font-normal leading-[26px] text-white/70 md:mt-5 md:text-[17px] md:leading-[28px] lg:max-w-[520px]">
              Paste a URL or upload a screenshot. Get a UX report with issues, explanations, and
              prioritized fixes.
            </p>

            <ul className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-5 sm:gap-y-2 lg:items-start lg:justify-start">
              {OUTCOMES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-[13px] text-white/45 md:text-[14px]">
                  <Icon size={15} className="shrink-0 text-white/60" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
              <Button
                href="/analyze"
                icon={<RiArrowRightLine size={18} aria-hidden />}
                fullWidth={false}
                className={HERO_BUTTON_CLASS}
              >
                Start free audit
              </Button>

              <Button
                href={DEMO_REPORT_PATH}
                variant="secondary"
                tone="dark"
                fullWidth={false}
                className={HERO_BUTTON_CLASS}
              >
                View sample report
              </Button>
            </div>
          </div>

          <div className="relative lg:pt-2">
            <div
              className="pointer-events-none absolute -inset-4 rounded-[40px] bg-[#2563EB]/8 blur-3xl md:-inset-6"
              aria-hidden
            />
            <LandingTestMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
