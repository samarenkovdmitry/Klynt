import Link from "next/link";
import {
  RiBrainLine,
  RiFilePdfLine,
  RiFlashlightLine,
  RiFocus3Line,
  RiListOrdered,
  RiPieChartLine,
  RiQuillPenLine,
  RiShieldCheckLine,
} from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";

import { DEMO_REPORT_PATH } from "@/lib/demo-report";

import {
  LANDING_CONTAINER,
  LANDING_EYEBROW,
  LANDING_LEAD,
  LANDING_LINK,
  LANDING_SECTION,
  LANDING_TITLE,
} from "./landingPageStyles";

const DIMENSIONS: {
  icon: RemixiconComponentType;
  title: string;
  description: string;
}[] = [
  {
    icon: RiShieldCheckLine,
    title: "Trust signals",
    description: "Proof, credibility, and reassurance that help visitors commit.",
  },
  {
    icon: RiFocus3Line,
    title: "Decision clarity",
    description: "Whether the offer and next step are obvious on first scan.",
  },
  {
    icon: RiBrainLine,
    title: "Cognitive friction",
    description: "Layout and copy that make the page harder to parse than it should be.",
  },
  {
    icon: RiFlashlightLine,
    title: "Conversion flow",
    description: "CTA hierarchy, distractions, and blockers that slow action.",
  },
];

const DELIVERABLES: {
  icon: RemixiconComponentType;
  title: string;
  hint: string;
}[] = [
  {
    icon: RiPieChartLine,
    title: "UX score breakdown",
    hint: "See where the page stands at a glance",
  },
  {
    icon: RiListOrdered,
    title: "Issues ranked by impact",
    hint: "Know what to fix first",
  },
  {
    icon: RiQuillPenLine,
    title: "Copy refinements",
    hint: "Before/after suggestions you can ship",
  },
  {
    icon: RiFilePdfLine,
    title: "Exportable PDF",
    hint: "Share with your team or client",
  },
];

export function LandingTestReportScope() {
  return (
    <section className={LANDING_SECTION} aria-labelledby="scope-heading">
      <div className={LANDING_CONTAINER}>
        <p className={LANDING_EYEBROW}>What Klynt evaluates</p>
        <h2 id="scope-heading" className={LANDING_TITLE}>
          Four lenses on landing-page clarity
        </h2>
        <p className={LANDING_LEAD}>
          Each report scores the page across dimensions that predict whether visitors understand,
          trust, and convert.
        </p>

        <ul className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-[12px] border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2 lg:mt-14">
          {DIMENSIONS.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.title} className="bg-[#12161F] p-5 sm:p-6 md:p-7">
                <Icon size={18} className="text-white/35" aria-hidden />
                <p className="mt-3 text-[16px] font-medium leading-[22px] text-white md:text-[17px]">
                  {item.title}
                </p>
                <p className="mt-1.5 text-[14px] leading-[22px] text-white/45 md:text-[15px] md:leading-[24px]">
                  {item.description}
                </p>
              </li>
            );
          })}
        </ul>

        <div className="mt-14 border-t border-white/[0.06] pt-10 md:mt-16 md:pt-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <p className={LANDING_EYEBROW}>Included in every report</p>
            <Link href={DEMO_REPORT_PATH} className={`${LANDING_LINK} shrink-0`}>
              View sample report →
            </Link>
          </div>

          <ul className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-[12px] border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4">
            {DELIVERABLES.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.title} className="bg-[#12161F] p-4 md:p-5">
                  <Icon size={16} className="text-white/35" aria-hidden />
                  <p className="mt-2.5 text-[14px] font-medium leading-[20px] text-white md:text-[15px]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[13px] leading-[18px] text-white/40">{item.hint}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
