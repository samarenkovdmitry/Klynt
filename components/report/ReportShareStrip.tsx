import { RiDownload2Line, RiShareForwardLine } from "@remixicon/react";

const STRIP_BUTTON_CLASS =
  "inline-flex h-[37px] items-center justify-center gap-2 rounded-full border border-[rgba(32,52,94,0.04)] bg-white/75 px-4 text-[14px] font-medium text-[var(--ink-primary)] shadow-[0_1px_2px_rgba(6,28,47,0.04)] backdrop-blur-xl transition hover:bg-white";

type ReportShareStripProps = {
  onShare: () => void;
  onExport: () => void;
};

export function ReportShareStrip({ onShare, onExport }: ReportShareStripProps) {
  return (
    <div className="rounded-2xl bg-[#ECF0F6] px-4 py-3 md:rounded-2xl md:px-4 md:py-[11px]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="text-center md:text-left">
          <p className="text-[16px] font-semibold leading-[21px] text-[var(--ink-primary)]">
            Share this UX insight with your team
          </p>
          <p className="mt-0.5 text-[14px] leading-[21px] text-[rgba(6,28,47,0.5)]">
            Turn this analysis into a conversation starter.
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-center gap-2 md:justify-end">
          <button type="button" onClick={onShare} className={STRIP_BUTTON_CLASS}>
            <RiShareForwardLine size={15} className="text-[#8E99A2]" />
            <span>Share</span>
          </button>
          <button type="button" onClick={onExport} className={STRIP_BUTTON_CLASS}>
            <RiDownload2Line size={16} className="text-[#8E99A2]" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
