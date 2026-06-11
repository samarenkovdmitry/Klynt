import { RiLockLine, RiPagesLine, RiSparklingLine } from "@remixicon/react";

import { LandingHeroUrlForm } from "./LandingHeroUrlForm";
import {
  LandingReportPreviewDesktop,
  LandingReportPreviewMobile,
} from "./LandingReportPreview";
import { LandingTestHeader } from "./LandingTestHeader";
import { LANDING_CONTAINER } from "./landingPageStyles";

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

      <div className={`${LANDING_CONTAINER} px-4 pb-16 pt-[calc(52px+env(safe-area-inset-top,0px)+5rem)] md:px-8 md:pb-20`}>
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_500px] lg:gap-20">
          <div className="min-w-0">
            <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-[rgba(29,158,117,0.18)] bg-[rgba(29,158,117,0.1)] px-3 py-[5px] text-[11px] font-medium uppercase tracking-[0.09em] text-[#1D9E75]">
              <RiSparklingLine size={14} aria-hidden />
              Free · No signup
            </div>

            <h1 className="max-w-[560px] font-sans text-[clamp(34px,4.5vw,58px)] font-bold leading-[1.1] tracking-[-0.05em] text-[#F2F2EF]">
              Your landing page,
              <br />
              <em className="not-italic text-[#1D9E75]">improved</em> — not just rated
            </h1>

            <p className="mt-5 max-w-[460px] text-[16px] leading-[1.75] text-[#9A9A93]">
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
                <>
                  <span className="hidden text-white/20 sm:inline" aria-hidden>
                    ·
                  </span>
                  <span className="inline-flex items-center gap-1 border-l border-white/[0.08] pl-3 sm:border-l sm:pl-3">
                    <RiPagesLine size={13} aria-hidden />
                    <strong className="font-medium text-[#9A9A93]">
                      {formatAuditedCount(auditedCount)}
                    </strong>{" "}
                    pages analyzed
                  </span>
                </>
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
