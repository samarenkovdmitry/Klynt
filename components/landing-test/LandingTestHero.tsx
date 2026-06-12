import { RiLockLine, RiPagesLine, RiSparklingLine } from "@remixicon/react";

import { LandingHeroUrlForm } from "./LandingHeroUrlForm";
import {
  LandingReportPreviewDesktop,
  LandingReportPreviewMobile,
} from "./LandingReportPreview";
import { LandingTestHeader } from "./LandingTestHeader";
import {
  LANDING_BADGE,
  LANDING_BODY,
  LANDING_CONTAINER,
  LANDING_DISPLAY_H1,
  LANDING_HERO_ACCENT,
} from "./landingPageStyles";

type LandingTestHeroProps = {
  auditedCount?: number | null;
};

function formatAuditedCount(count: number) {
  return `${count.toLocaleString("en-US")}+`;
}

export function LandingTestHero({ auditedCount = null }: LandingTestHeroProps) {
  const hasAuditedCount = typeof auditedCount === "number" && auditedCount > 0;

  return (
    <section id="hero" className="scroll-mt-[52px]">
      <LandingTestHeader />

      <div className={`${LANDING_CONTAINER} px-4 pb-16 pt-[calc(52px+env(safe-area-inset-top,0px)+4rem)] md:px-8 md:pb-20`}>
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_500px] lg:gap-20">
          <div className="min-w-0">
            <div className={`mb-6 ${LANDING_BADGE}`}>
              <RiSparklingLine size={14} className="text-[#9A9A93]" aria-hidden />
              Free · No signup
            </div>

            <h1 className={`max-w-[560px] ${LANDING_DISPLAY_H1}`}>
              Your landing page,
              <br />
              <em className={LANDING_HERO_ACCENT}>improved</em> — not just rated
            </h1>

            <p className={`mt-5 max-w-[460px] ${LANDING_BODY}`}>
              Paste a URL and get copy variants, a fix checklist, and tasks your team can ship. In
              about a minute.
            </p>

            <LandingHeroUrlForm className="mt-7" />

            <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] text-[#7A7A74]">
              <span className="inline-flex items-center gap-1">
                <RiLockLine size={13} aria-hidden />
                URLs never stored or shared
              </span>
              {hasAuditedCount ? (
                <span className="inline-flex items-center gap-1 border-l border-white/[0.08] pl-3">
                    <RiPagesLine size={13} aria-hidden />
                    <strong className="font-medium text-[#9A9A93]">
                      {formatAuditedCount(auditedCount)}
                    </strong>{" "}
                    pages analyzed
                </span>
              ) : null}
            </div>

            <LandingReportPreviewMobile />
          </div>

          <LandingReportPreviewDesktop />
        </div>
      </div>
    </section>
  );
}
