"use client";

import { useId, useState } from "react";
import { RiQuestionLine } from "@remixicon/react";

import { REPORT_PREVIEW_HEIGHT, REPORT_PREVIEW_WIDTH } from "@/lib/report-preview-size";

type ReportPagePreviewProps = {
  previewImage?: string;
  topIssueTitle?: string;
};

export function ReportPagePreview({
  previewImage,
  topIssueTitle,
}: ReportPagePreviewProps) {
  const tooltipId = useId();
  const [showTooltip, setShowTooltip] = useState(false);

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
        <>
          <p className="mt-3 text-[15px] leading-[19px] text-[var(--ink-primary)] md:hidden">
            {topIssueTitle}
          </p>

          <div className="mt-2 hidden justify-center md:flex">
            <div className="inline-flex max-w-full items-center gap-2 rounded-[13px] bg-white px-2.5 py-1 shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
              <p className="max-w-[240px] truncate text-[15px] leading-[19px] text-[var(--ink-primary)]">
                {topIssueTitle}
              </p>

              <span
                className="group relative shrink-0"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onFocus={() => setShowTooltip(true)}
                onBlur={() => setShowTooltip(false)}
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white ring-1 ring-black/[0.06]"
                  aria-describedby={tooltipId}
                  role="button"
                  tabIndex={0}
                >
                  <RiQuestionLine size={16} className="text-[rgba(6,28,47,0.55)]" aria-hidden />
                </span>

                <span
                  id={tooltipId}
                  role="tooltip"
                  className={`pointer-events-none absolute bottom-[calc(100%+8px)] right-0 z-10 w-[min(280px,calc(100vw-2rem))] rounded-[13px] bg-white px-3 py-2 text-left text-[14px] leading-[19px] text-[var(--ink-primary)] shadow-[0_10px_40px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.06] transition-opacity duration-150 ${
                    showTooltip ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {topIssueTitle}
                </span>
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
