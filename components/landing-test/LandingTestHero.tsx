import Link from "next/link";
import {
  RiArrowRightLine,
  RiCheckLine,
  RiFilePdf2Line,
  RiListOrdered,
  RiPieChartLine,
} from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";

import { LandingTestMockup } from "./LandingTestMockup";
import { DEMO_REPORT_PATH } from "@/lib/demo-report";
import { LANDING_BUTTON_PRIMARY, LANDING_BUTTON_SECONDARY, LANDING_CONTAINER } from "./landingPageStyles";

const FALLBACK_AUDITED_COUNT = 469;

const HERO_FEATURES: { icon: RemixiconComponentType; label: string }[] = [
  { icon: RiPieChartLine, label: "UX score breakdown" },
  { icon: RiListOrdered, label: "Prioritized fixes" },
  { icon: RiFilePdf2Line, label: "Shareable PDF" },
];

const HERO_PRIMARY_BUTTON_CLASS = `${LANDING_BUTTON_PRIMARY} w-full sm:w-auto`;

type LandingTestHeroProps = {
  auditedCount?: number | null;
};

export function LandingTestHero({ auditedCount = null }: LandingTestHeroProps) {
  const displayCount =
    typeof auditedCount === "number" && auditedCount > 0
      ? auditedCount.toLocaleString("en-US")
      : FALLBACK_AUDITED_COUNT.toLocaleString("en-US");

  return (
    <section className="relative overflow-hidden">
      <div className={`relative z-10 ${LANDING_CONTAINER} px-5 pb-14 pt-8 md:px-6 md:pb-20 md:pt-12`}>
        <div className="grid min-w-0 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,556px)] lg:gap-12 xl:gap-16">
          <div className="mx-auto min-w-0 max-w-[640px] text-center lg:mx-0 lg:-mt-4 lg:max-w-none lg:text-left">
            <h1 className="max-w-[560px] text-[36px] font-semibold leading-[1.06] tracking-[-0.02em] text-white md:text-[48px] md:leading-[1.06] lg:max-w-none xl:text-[52px] xl:leading-[1.06] xl:tracking-[-0.02em]">
              Instant UX reviews
              <br />
              for landing pages
            </h1>

            <p className="mt-4 max-w-[560px] text-[16px] font-normal leading-[26px] text-white/70 md:mt-5 md:text-[17px] md:leading-[28px] lg:max-w-[520px]">
              Klynt finds the hidden UX and messaging issues keeping visitors from converting.
            </p>

            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 lg:mt-7 lg:justify-start">
              {HERO_FEATURES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon size={15} className="shrink-0 text-white/60" aria-hidden />
                  <span className="text-[14px] leading-[21px] text-white/45">{label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
              <Link href="/analyze" className={HERO_PRIMARY_BUTTON_CLASS}>
                <RiArrowRightLine size={18} aria-hidden />
                Start free audit
              </Link>
              <Link
                href={DEMO_REPORT_PATH}
                className={`${LANDING_BUTTON_SECONDARY} w-full sm:w-auto`}
              >
                View sample report
              </Link>
            </div>

            <div className="mt-4 flex justify-center lg:justify-start">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <RiCheckLine size={12} className="text-white" aria-hidden />
                </span>
                <p className="text-[13px] leading-none text-white/45 md:text-[14px]">
                  <span className="font-medium text-white/60">{displayCount}</span>
                  {" landing pages audited so far"}
                </p>
              </div>
            </div>
          </div>

          <div className="relative min-w-0 w-full lg:pt-2">
            <LandingTestMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
