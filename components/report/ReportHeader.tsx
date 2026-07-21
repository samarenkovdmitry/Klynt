import { RiDownload2Line, RiShareForwardLine } from "@remixicon/react";
import { REPORT_ACTION_BUTTON_CLASS } from "@/components/report/reportStyles";

type ReportHeaderProps = {
  url?: string;
  generatedAt?: string;
  onExport: () => void;
  onShare: () => void;
};

function formatReportDate(value?: string) {
  const date = value ? new Date(value) : new Date();

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ReportHeader({
  url,
  generatedAt,
  onExport,
  onShare,
}: ReportHeaderProps) {
  return (
    <div className="flex flex-col gap-6 px-5 py-6 md:px-10 md:py-8 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[34px] font-semibold leading-none tracking-[-0.04em] text-[var(--ink-primary)] md:text-[42px]">
            Clarity Report
          </h1>

          <div className="rounded-full border border-[var(--nordic-border)] bg-[var(--nordic-bg)] px-3 py-1 text-[12px] font-semibold text-[var(--brand-primary)]">
            AI Generated
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-1 gap-y-1 text-[13px] text-[var(--ink-secondary)] md:gap-x-2 md:text-[14px]">
          <div className="flex min-w-0 items-center gap-2">
            {url && (
              <img
                src={`https://www.google.com/s2/favicons?domain_url=${url}&sz=32`}
                alt=""
                className="h-4 w-4 shrink-0 rounded-sm"
              />
            )}
            <span className="truncate">{url}</span>
          </div>

          <span className="text-neutral-300">•</span>
          <span className="shrink-0">{formatReportDate(generatedAt)}</span>
        </div>
      </div>

      <div className="flex w-full gap-2 sm:w-auto">
        <button type="button" onClick={onExport} className={REPORT_ACTION_BUTTON_CLASS}>
          <RiDownload2Line size={18} />
          <span>Export PDF</span>
        </button>

        <button type="button" onClick={onShare} className={REPORT_ACTION_BUTTON_CLASS}>
          <RiShareForwardLine size={18} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}
