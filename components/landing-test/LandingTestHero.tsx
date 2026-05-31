import {
  RiArrowRightLine,
  RiFilePdfLine,
  RiLightbulbLine,
  RiPieChartLine,
} from "@remixicon/react";

import { LandingHeroOpArt } from "@/components/LandingHeroOpArt";
import { PreLaunchProductHuntBanner } from "@/components/pre-launch/PreLaunchWaitlist";
import { Button } from "@/components/ui/Button";
import { TrustBadgeRow } from "@/components/TrustBadgeRow";
import { LANDING_BUTTON_CLASS } from "@/components/landing/landingStyles";
import { DEMO_REPORT_PATH } from "@/lib/demo-report";

import { LandingTestHeader } from "./LandingTestHeader";
import { LandingTestMockup } from "./LandingTestMockup";

const OUTCOMES = [
  { icon: RiPieChartLine, label: "UX score breakdown" },
  { icon: RiLightbulbLine, label: "Prioritized fixes" },
  { icon: RiFilePdfLine, label: "Shareable PDF" },
] as const;

export function LandingTestHero() {
  return (
    <section className="relative overflow-hidden bg-[#0E1B36]">
      <LandingHeroOpArt />
      <LandingTestHeader />

      <div className="relative z-10 mx-auto max-w-[1180px] px-5 pb-14 pt-8 md:px-6 md:pb-20 md:pt-12">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12 xl:gap-16">
          <div className="mx-auto max-w-[640px] text-center lg:mx-0 lg:max-w-none lg:text-left">
            <PreLaunchProductHuntBanner />

            <p className="text-[15px] font-normal leading-5 text-white/55">AI UX Review</p>

            <h1 className="mt-3 max-w-[560px] text-[40px] font-semibold leading-[1.08] tracking-[-0.02em] text-white md:text-[52px] md:leading-[1.06] lg:max-w-none xl:text-[56px]">
              Clarity drives conversion
            </h1>

            <p className="mt-4 max-w-[520px] text-[17px] font-normal leading-[28px] text-white/75 md:mt-5 md:text-[18px] md:leading-[30px] lg:max-w-[480px]">
              Paste a URL or upload a screenshot. Klynt flags friction, weak copy, and trust
              gaps — with fixes you can ship.
            </p>

            <ul className="mt-6 flex flex-col items-center gap-2.5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-5 sm:gap-y-2 lg:items-start lg:justify-start">
              {OUTCOMES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-[14px] text-white/50">
                  <Icon size={16} className="shrink-0 text-white/65" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                href="/analyze"
                icon={<RiArrowRightLine size={18} aria-hidden />}
                fullWidth={false}
                className={LANDING_BUTTON_CLASS}
              >
                Start free audit
              </Button>

              <Button
                href={DEMO_REPORT_PATH}
                variant="secondary"
                tone="dark"
                fullWidth={false}
                className="!h-[52px] !min-h-[52px] !rounded-full !px-6 !text-[15px]"
              >
                View sample report
              </Button>
            </div>

            <TrustBadgeRow variant="dark" gray className="mt-6 md:mt-7 lg:justify-start" />
          </div>

          <div className="relative lg:pt-2">
            <div
              className="pointer-events-none absolute -inset-4 rounded-[40px] bg-[#2563EB]/10 blur-3xl md:-inset-6"
              aria-hidden
            />
            <LandingTestMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
