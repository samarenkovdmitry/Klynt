import { RiArrowRightLine } from "@remixicon/react";
import { Button } from "@/components/ui/Button";
import { LandingCtaOpArt } from "@/components/LandingHeroOpArt";
import { TrustBadgeRow } from "@/components/TrustBadgeRow";
import { LANDING_BUTTON_CLASS } from "@/components/landing/landingStyles";
import { DEMO_REPORT_PATH } from "@/lib/demo-report";

export function LandingCtaSection() {
  return (
    <section className="px-5 py-12 md:px-6 md:py-28">
      <div className="relative mx-auto max-w-[1040px] overflow-hidden rounded-[28px] bg-[var(--surface-dark)] px-5 py-12 md:rounded-[36px] md:px-10 md:py-16">
        <LandingCtaOpArt />

        <div className="relative z-10 mx-auto max-w-[760px] text-center">
          <h2 className="text-[42px] font-normal leading-[0.95] tracking-[-0.04em] text-white md:text-[48px]">
            Improve clarity before shipping
          </h2>

          <p className="mx-auto mt-6 max-w-[620px] text-[17px] leading-8 text-white/75 md:text-[19px]">
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
      </div>
    </section>
  );
}
