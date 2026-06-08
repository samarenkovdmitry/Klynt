import { RiArrowRightLine } from "@remixicon/react";
import { Button } from "@/components/ui/Button";
import { TrustBadgeRow } from "@/components/TrustBadgeRow";
import { LANDING_BUTTON_CLASS } from "@/components/landing/landingStyles";
import { DEMO_REPORT_PATH, DEMO_REPORT_SLUG } from "@/lib/demo-report";

export function LandingCtaSection() {
  return (
    <section className="bg-[#0E1B36] px-5 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[760px] text-center">
        <h2 className="text-[38px] font-normal leading-[0.95] tracking-[-0.04em] text-white md:text-[52px]">
          Improve clarity before shipping
        </h2>

        <p className="mx-auto mt-6 max-w-[560px] text-[17px] leading-8 text-white/70 md:text-[19px]">
          Analyze your interface, uncover UX friction and improve conversion
          with AI-powered insights.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            href="/analyze"
            icon={<RiArrowRightLine size={18} />}
            fullWidth={false}
            className={LANDING_BUTTON_CLASS}
          >
            Start free audit
          </Button>

          <Button
            href={DEMO_REPORT_PATH}
            prefetchRouteParam={DEMO_REPORT_SLUG}
            variant="secondary"
            tone="dark"
            fullWidth={false}
            className={LANDING_BUTTON_CLASS}
          >
            View demo
          </Button>
        </div>

        <TrustBadgeRow variant="dark" className="mt-5" />
      </div>
    </section>
  );
}
