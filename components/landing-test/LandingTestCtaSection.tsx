import Link from "next/link";
import { RiArrowRightLine } from "@remixicon/react";

import { Button } from "@/components/ui/Button";
import { DEMO_REPORT_PATH } from "@/lib/demo-report";

import {
  LANDING_BUTTON,
  LANDING_CONTAINER,
  LANDING_LEAD,
  LANDING_LINK,
  LANDING_SECTION,
  LANDING_TITLE,
} from "./landingPageStyles";

export function LandingTestCtaSection() {
  return (
    <section className={`${LANDING_SECTION} pb-24 md:pb-32`}>
      <div className={LANDING_CONTAINER}>
        <div className="max-w-[560px]">
          <h2 className={`${LANDING_TITLE} mt-0`}>See what your visitors are missing</h2>
          <p className={LANDING_LEAD}>
            Run a free UX analysis — no signup, results in about a minute.
          </p>

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5 md:mt-10">
            <Button
              href="/analyze"
              icon={<RiArrowRightLine size={18} aria-hidden />}
              fullWidth={false}
              className={LANDING_BUTTON}
            >
              Start free audit
            </Button>

            <Link href={DEMO_REPORT_PATH} className={LANDING_LINK}>
              View sample report
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
