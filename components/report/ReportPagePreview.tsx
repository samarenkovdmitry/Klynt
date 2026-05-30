import { formatReportDomain } from "@/lib/report-hero-theme";

type ReportPagePreviewProps = {
  url?: string;
  topIssueTitle?: string;
};

export function ReportPagePreview({ url, topIssueTitle }: ReportPagePreviewProps) {
  const domain = formatReportDomain(url);

  return (
    <div className="relative mx-auto w-full max-w-[313px] pb-6">
      <div className="overflow-hidden rounded-lg border border-black/[0.09] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 border-b border-black/[0.06] bg-[#F8FAFC] px-3 py-2">
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-[#FF5F57]" />
            <span className="h-2 w-2 rounded-full bg-[#FEBC2E]" />
            <span className="h-2 w-2 rounded-full bg-[#28C840]" />
          </div>
          {domain && (
            <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 text-[11px] text-[rgba(6,28,47,0.45)]">
              {url && (
                <img
                  src={`https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(url)}&sz=32`}
                  alt=""
                  className="h-3.5 w-3.5 shrink-0 rounded-sm"
                />
              )}
              <span className="truncate">{domain}</span>
            </div>
          )}
        </div>

        <div className="relative h-[132px] bg-gradient-to-b from-[#F8FAFC] to-[#EEF2F7]">
          <div className="absolute inset-x-4 top-4 space-y-2">
            <div className="h-2.5 w-2/3 rounded bg-[rgba(6,28,47,0.08)]" />
            <div className="h-2.5 w-1/2 rounded bg-[rgba(6,28,47,0.06)]" />
            <div className="mt-4 h-16 rounded-md bg-[rgba(6,28,47,0.04)]" />
          </div>
        </div>
      </div>

      {topIssueTitle && (
        <div className="absolute inset-x-0 bottom-0 translate-y-1/2 px-3">
          <div className="rounded-[13px] bg-white px-3 py-1.5 text-center text-[15px] leading-[19px] text-[var(--ink-primary)] shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
            {topIssueTitle}
          </div>
        </div>
      )}
    </div>
  );
}
