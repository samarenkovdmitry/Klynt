import { RiFilePdf2Line, RiShare2Line } from "@remixicon/react";

import {
  REPORT_SURFACE_BORDER_CLASS,
  REPORT_SURFACE_SHADOW_CLASS,
} from "@/components/report/reportStyles";

type ReportShareStripProps = {
  onShare: () => void;
  onExport: () => void;
};

export function ReportShareStrip({ onShare, onExport }: ReportShareStripProps) {
  return (
    <div
      className={`rounded-[32px] bg-white p-5 md:py-[11px] md:pl-6 md:pr-4 ${REPORT_SURFACE_BORDER_CLASS} ${REPORT_SURFACE_SHADOW_CLASS}`}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="text-center md:text-left">
          <p className="text-[16px] font-normal leading-[21px] text-[var(--ink-primary)]">
            Turn this analysis into a conversation starter.
          </p>
        </div>

        <div className="flex w-full shrink-0 items-center justify-center gap-4 md:w-auto md:justify-end">
          <button
            type="button"
            onClick={onShare}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#2563EB] px-4 text-[14px] font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            <RiShare2Line size={16} aria-hidden />
            Share
          </button>
          <button
            type="button"
            onClick={onExport}
            className="inline-flex h-9 items-center gap-1.5 text-[14px] font-medium text-[rgba(6,28,47,0.55)] transition hover:text-[var(--ink-primary)]"
          >
            <RiFilePdf2Line size={16} aria-hidden />
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
