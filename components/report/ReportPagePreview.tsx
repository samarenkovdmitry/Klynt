import { SiteFavicon } from "@/components/report/SiteFavicon";

type ReportPagePreviewProps = {
  domain?: string;
  previewImage?: string;
  topIssueTitle?: string;
};

const PREVIEW_ASPECT_CLASS = "aspect-[620/380]";

export function ReportPagePreview({
  domain,
  previewImage,
  topIssueTitle,
}: ReportPagePreviewProps) {
  return (
    <div className="relative mx-auto w-[310px] pb-5">
      <div className="relative z-[1] overflow-hidden rounded-lg border border-black/[0.08] bg-[#F8FAFC] shadow-[0_8px_28px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-1.5 border-b border-black/[0.06] bg-white px-2.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF5F57]" aria-hidden />
          <span className="h-1.5 w-1.5 rounded-full bg-[#FFBD2E]" aria-hidden />
          <span className="h-1.5 w-1.5 rounded-full bg-[#28CA41]" aria-hidden />
          {domain ? (
            <span className="ml-1 truncate text-[10px] text-[rgba(6,28,47,0.45)]">{domain}</span>
          ) : null}
        </div>

        <div
          className={`relative flex w-full items-center justify-center overflow-hidden bg-gradient-to-b from-[#F8FAFC] to-[#EEF2F7] ${PREVIEW_ASPECT_CLASS}`}
        >
          <SiteFavicon domain={domain} size={64} className="h-16 w-16 rounded-lg" />
        </div>
      </div>

      {topIssueTitle && (
        <div className="absolute bottom-0 left-1/2 z-10 w-[calc(100%-20px)] -translate-x-1/2">
          <div className="rounded-[10px] bg-white px-3 py-2 shadow-[0_4px_20px_rgba(6,28,47,0.12)]">
            <p className="truncate text-[12px] leading-[17px] text-[var(--ink-primary)] md:text-[13px] md:leading-[18px]">
              <span className="font-medium text-[rgba(6,28,47,0.45)]">Top issue · </span>
              {topIssueTitle}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
