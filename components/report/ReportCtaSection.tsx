import { RiArrowRightLine, RiFilePdfLine } from "@remixicon/react";

import { Button } from "@/components/ui/Button";
import {
  REPORT_HERO_RADIUS_CLASS,
  REPORT_SURFACE_BORDER_CLASS,
  REPORT_SURFACE_SHADOW_CLASS,
} from "@/components/report/reportStyles";

type ReportCtaSectionProps = {
  onRerun: () => void;
  onExport: () => void;
};

const CTA_BUTTON_CLASS =
  "!h-[52px] !min-h-[52px] !rounded-full !px-7 !text-[15px] !font-semibold hover:!translate-y-0";

export function ReportCtaSection({ onRerun, onExport }: ReportCtaSectionProps) {
  return (
    <section
      className={`overflow-hidden bg-white px-[25px] py-8 text-center md:px-10 md:py-16 ${REPORT_HERO_RADIUS_CLASS} ${REPORT_SURFACE_BORDER_CLASS} ${REPORT_SURFACE_SHADOW_CLASS}`}
    >
      <div className="mx-auto max-w-[760px]">
        <p className="text-[15px] font-normal leading-5 text-[#8E99A2]">Next Step</p>

        <h3 className="mt-4 text-[30px] font-bold leading-[30px] tracking-[-0.01em] text-[var(--ink-primary)] md:text-[36px] md:leading-9">
          Improve your UX and run another analysis
        </h3>

        <p className="mt-4 text-[16px] leading-5 text-[rgba(6,28,47,0.5)] md:leading-[25px]">
          Iterate on messaging, trust, hierarchy and conversion flow — then
          compare updated UX scores.
        </p>

        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Button
            type="button"
            variant="accent"
            fullWidth={false}
            className={`${CTA_BUTTON_CLASS} sm:min-w-[200px]`}
            icon={<RiArrowRightLine size={18} aria-hidden />}
            onClick={onRerun}
          >
            Re-run analysis
          </Button>

          <Button
            type="button"
            variant="secondary"
            tone="light"
            fullWidth={false}
            className={`${CTA_BUTTON_CLASS} hover:!bg-[#F8FAFC] sm:min-w-[200px]`}
            icon={<RiFilePdfLine size={18} aria-hidden />}
            onClick={onExport}
          >
            Export PDF
          </Button>
        </div>
      </div>
    </section>
  );
}
