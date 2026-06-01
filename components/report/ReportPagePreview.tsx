import { REPORT_PREVIEW_HEIGHT, REPORT_PREVIEW_WIDTH } from "@/lib/report-preview-size";

type ReportPagePreviewProps = {
  previewImage?: string;
  topIssueTitle?: string;
};

export function ReportPagePreview({
  previewImage,
  topIssueTitle,
}: ReportPagePreviewProps) {
  return (
    <div className="mx-auto w-[310px]">
      {previewImage ? (
        <img
          src={previewImage}
          alt="Analyzed page preview"
          width={REPORT_PREVIEW_WIDTH}
          height={REPORT_PREVIEW_HEIGHT}
          className="block h-[190px] w-[310px] rounded-lg border border-black/[0.09] object-cover object-top shadow-[0_10px_40px_rgba(0,0,0,0.03)]"
        />
      ) : (
        <div className="relative h-[190px] w-[310px] overflow-hidden rounded-lg border border-black/[0.09] bg-gradient-to-b from-[#F8FAFC] to-[#EEF2F7] shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
          <div className="absolute inset-x-4 top-4 space-y-2">
            <div className="h-2.5 w-2/3 rounded bg-[rgba(6,28,47,0.08)]" />
            <div className="h-2.5 w-1/2 rounded bg-[rgba(6,28,47,0.06)]" />
            <div className="mt-4 h-16 rounded-md bg-[rgba(6,28,47,0.04)]" />
          </div>
        </div>
      )}

      {topIssueTitle && (
        <div className="mt-3">
          <p className="mb-1.5 text-[11px] font-medium text-[rgba(6,28,47,0.45)] md:text-[12px]">
            Top issue
          </p>
          <div className="rounded-[10px] border border-[rgba(32,52,94,0.08)] bg-[#F8FAFC] px-3 py-2.5">
            <p className="line-clamp-2 text-[12px] leading-[17px] text-[var(--ink-primary)] md:text-[13px] md:leading-[18px]">
              {topIssueTitle}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
