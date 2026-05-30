import { RiFilePdf2Line, RiShare2Line } from "@remixicon/react";

const STRIP_ACTION_CLASS =
  "inline-flex h-[37px] w-full items-center justify-center gap-2 rounded-full border border-[rgba(32,52,94,0.04)] bg-white px-4 text-[14px] font-medium text-[var(--ink-primary)] transition hover:bg-[#F8FAFC] md:w-auto";

type ReportShareStripProps = {
  onShare: () => void;
  onExport: () => void;
};

export function ReportShareStrip({ onShare, onExport }: ReportShareStripProps) {
  return (
    <div className="rounded-full bg-[#ECF0F6] py-3 pl-6 pr-4 md:py-[11px]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="text-center md:text-left">
          <p className="text-[16px] font-normal leading-[21px] text-[var(--ink-primary)]">
            Turn this analysis into a conversation starter.
          </p>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2 md:w-auto md:flex-row md:justify-end">
          <button type="button" onClick={onShare} className={STRIP_ACTION_CLASS}>
            <RiShare2Line size={16} className="text-[#8E99A2]" aria-hidden />
            <span>Share</span>
          </button>
          <button type="button" onClick={onExport} className={STRIP_ACTION_CLASS}>
            <RiFilePdf2Line size={16} className="text-[#8E99A2]" aria-hidden />
            <span>Export PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
