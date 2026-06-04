export const REPORT_SECTION_ANCHORS = {
  issues: "report-issues",
  improvements: "report-improvements",
  copy: "report-copy",
} as const;

export type ReportSectionKind = keyof typeof REPORT_SECTION_ANCHORS;

export const REPORT_SECTION_META: Record<
  ReportSectionKind,
  { title: string; shortLabel: string; lead: string }
> = {
  issues: {
    title: "UX Issues",
    shortLabel: "Issues",
    lead: "Friction points ranked by impact on clarity, trust, and conversion.",
  },
  improvements: {
    title: "Suggested Improvements",
    shortLabel: "Fixes",
    lead: "Concrete changes to ship — ordered by expected UX lift.",
  },
  copy: {
    title: "Copy Refinement",
    shortLabel: "Copy",
    lead: "Before and after text you can paste into your site.",
  },
};

export type ReportSectionNavItem = {
  kind: ReportSectionKind;
  count: number;
};

export function buildReportSectionNavItems(
  counts: Partial<Record<ReportSectionKind, number>>
): ReportSectionNavItem[] {
  return (Object.keys(REPORT_SECTION_ANCHORS) as ReportSectionKind[])
    .map((kind) => ({ kind, count: counts[kind] ?? 0 }))
    .filter((item) => item.count > 0);
}
