import { RiLock2Line } from "@remixicon/react";

import type { ReportWaitlistLockedSummary } from "@/lib/pre-launch";

function buildHiddenSummary({
  remainingIssues,
  remainingSuggestions,
  remainingCopy,
}: ReportWaitlistLockedSummary) {
  const parts: string[] = [];

  if (remainingIssues > 0) {
    parts.push(
      `${remainingIssues} UX issue${remainingIssues === 1 ? "" : "s"}`
    );
  }

  if (remainingSuggestions > 0) {
    parts.push(
      `${remainingSuggestions} fix${remainingSuggestions === 1 ? "" : "es"}`
    );
  }

  if (remainingCopy > 0) {
    parts.push(
      `${remainingCopy} copy rewrite${remainingCopy === 1 ? "" : "s"}`
    );
  }

  if (parts.length === 0) {
    return "Additional report sections";
  }

  if (parts.length === 1) {
    return parts[0];
  }

  if (parts.length === 2) {
    return `${parts[0]} and ${parts[1]}`;
  }

  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

type ReportWaitlistPreviewBannerProps = {
  locked: ReportWaitlistLockedSummary;
};

export function ReportWaitlistPreviewBanner({
  locked,
}: ReportWaitlistPreviewBannerProps) {
  const summary = buildHiddenSummary(locked);

  return (
    <div className="mx-auto mt-8 flex max-w-[640px] items-center justify-center gap-2 rounded-full border border-[rgba(6,28,47,0.08)] bg-[#F8FAFC] px-4 py-3 text-center text-[14px] leading-5 text-[rgba(6,28,47,0.65)]">
      <RiLock2Line size={16} className="shrink-0 text-[rgba(6,28,47,0.45)]" aria-hidden />
      <span>
        <span className="font-medium text-[var(--ink-primary)]">{summary}</span>{" "}
        hidden in the full report
      </span>
    </div>
  );
}
