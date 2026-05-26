import { RiArrowRightLine } from "@remixicon/react";

import { Button } from "@/components/ui/Button";
import { TrustBadgeRow } from "@/components/TrustBadgeRow";
import { LANDING_BUTTON_CLASS } from "@/components/landing/landingStyles";
import { DEMO_REPORT_PATH } from "@/lib/demo-report";

/** Rounded CTA block from Klynt Interface Kit (Figma landing frame). */
export function FigmaLandingCtaSection() {
  return (
    <section className="px-4 py-10 sm:px-5 md:px-6 md:py-28">
      <div className="relative mx-auto max-w-[1040px] overflow-hidden rounded-[24px] bg-[var(--surface-dark)] px-5 py-10 sm:rounded-[28px] sm:px-6 sm:py-12 md:rounded-[36px] md:px-10 md:py-16">
        <div className="mx-auto max-w-[760px] text-center">
          <h2 className="text-[34px] font-normal leading-[0.95] tracking-[-0.04em] text-white sm:text-[42px] md:text-[48px]">
            Improve clarity before shipping
          </h2>

          <p className="mx-auto mt-5 max-w-[620px] text-[16px] leading-7 text-white/75 sm:mt-6 sm:text-[17px] sm:leading-8 md:text-[19px]">
            Analyze your interface, uncover UX friction and improve conversion
            with AI-powered insights.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center">
            <Button
              href="/analyze"
              icon={<RiArrowRightLine size={18} />}
              fullWidth={false}
              className={`${LANDING_BUTTON_CLASS} w-full sm:w-auto`}
            >
              Start free audit
            </Button>

            <Button
              href={DEMO_REPORT_PATH}
              variant="secondary"
              tone="dark"
              fullWidth={false}
              className={`${LANDING_BUTTON_CLASS} w-full sm:w-auto`}
            >
              View demo
            </Button>
          </div>

          <TrustBadgeRow variant="dark" className="mt-5" />
        </div>
      </div>
    </section>
  );
}
