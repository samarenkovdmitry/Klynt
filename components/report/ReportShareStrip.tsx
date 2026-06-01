import { RiFilePdf2Line, RiShare2Line } from "@remixicon/react";

import {
  REPORT_SURFACE_BORDER_CLASS,
  REPORT_SURFACE_SHADOW_CLASS,
} from "@/components/report/reportStyles";

const STRIP_ACTION_CLASS =
  "inline-flex h-[37px] flex-1 items-center justify-center gap-2 rounded-full border border-[rgba(6,28,47,0.10)] bg-white px-4 text-[14px] font-medium leading-[21px] text-[var(--ink-primary)] transition hover:bg-[#F8FAFC] md:w-auto md:flex-none md:px-4";

const STRIP_ACTION_ICON_CLASS = "text-[var(--ink-primary)]";

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

        <div className="flex w-full shrink-0 flex-row gap-2 md:w-auto md:justify-end">
          <button type="button" onClick={onShare} className={STRIP_ACTION_CLASS}>
            <RiShare2Line size={18} className={STRIP_ACTION_ICON_CLASS} aria-hidden />
            <span>Share</span>
          </button>
          <button type="button" onClick={onExport} className={STRIP_ACTION_CLASS}>
            <RiFilePdf2Line size={18} className={STRIP_ACTION_ICON_CLASS} aria-hidden />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
}
