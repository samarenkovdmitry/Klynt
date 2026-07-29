import Link from "next/link";
import { RiArrowRightLine } from "@remixicon/react";

import { DEMO_REPORT_PATH } from "@/lib/demo-report";

import {
  LANDING_BUTTON_PRIMARY,
  LANDING_BUTTON_SECONDARY,
  LANDING_LEAD,
  LANDING_SECTION,
  LANDING_TITLE,
} from "./landingPageStyles";

export function LandingTestCtaSection() {
  return (
    <section className={`${LANDING_SECTION} pb-24 md:pb-32`}>
      <div className="mx-auto max-w-[560px] text-center">
        <h2 className={`${LANDING_TITLE} mx-auto mt-0`}>See what your visitors are missing</h2>
        <p className={`${LANDING_LEAD} mx-auto`}>
          Run a free UX analysis, no signup, results in about a minute.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-center md:mt-10">
          <Link href="/analyze" className={`${LANDING_BUTTON_PRIMARY} w-full sm:w-auto`}>
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
      </div>
    </section>
  );
}
