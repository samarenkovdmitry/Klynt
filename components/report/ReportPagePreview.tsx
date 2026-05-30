"use client";

import { RiQuestionLine } from "@remixicon/react";

import { REPORT_PREVIEW_HEIGHT, REPORT_PREVIEW_WIDTH } from "@/lib/report-preview-size";
import { formatReportDomain } from "@/lib/report-hero-theme";

type ReportPagePreviewProps = {
  url?: string;
  previewImage?: string;
  topIssueTitle?: string;
};

export function ReportPagePreview({
  url,
  previewImage,
  topIssueTitle,
}: ReportPagePreviewProps) {
  const domain = formatReportDomain(url);

  return (
    <div className="mx-auto w-[310px]">
      {previewImage ? (
        <img
          src={previewImage}
          alt={`Preview of ${domain || "analyzed page"}`}
          width={REPORT_PREVIEW_WIDTH}
          height={REPORT_PREVIEW_HEIGHT}
          className="block h-[190px] w-[310px] rounded-lg object-cover object-top shadow-[0_10px_40px_rgba(0,0,0,0.03)]"
        />
      ) : (
        <div className="relative h-[190px] w-[310px] overflow-hidden rounded-lg bg-gradient-to-b from-[#F8FAFC] to-[#EEF2F7] shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
          <div className="absolute inset-x-4 top-4 space-y-2">
            <div className="h-2.5 w-2/3 rounded bg-[rgba(6,28,47,0.08)]" />
            <div className="h-2.5 w-1/2 rounded bg-[rgba(6,28,47,0.06)]" />
            <div className="mt-4 h-16 rounded-md bg-[rgba(6,28,47,0.04)]" />
          </div>
        </div>
      )}

      {topIssueTitle && (
        <>
          <p className="mt-3 text-center text-[15px] leading-[19px] text-[var(--ink-primary)] md:hidden">
            {topIssueTitle}
          </p>

          <div className="mt-3 hidden items-start gap-2 md:flex">
            <p className="min-w-0 flex-1 text-center text-[15px] leading-[19px] text-[var(--ink-primary)] line-clamp-2">
              {topIssueTitle}
            </p>

            <span className="group relative mt-0.5 shrink-0">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.06]"
                aria-label="Full insight"
                role="button"
                tabIndex={0}
              >
                <RiQuestionLine size={16} className="text-[rgba(6,28,47,0.55)]" aria-hidden />
              </span>

              <span
                role="tooltip"
                className="pointer-events-none absolute bottom-[calc(100%+8px)] right-0 z-10 w-[min(280px,calc(100vw-2rem))] rounded-[13px] bg-white px-3 py-2 text-left text-[14px] leading-[19px] text-[var(--ink-primary)] opacity-0 shadow-[0_10px_40px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.06] transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
              >
                {topIssueTitle}
              </span>
            </span>
          </div>
        </>
      )}
    </div>
  );
}
