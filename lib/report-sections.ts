export const REPORT_SECTION_ANCHORS = {
  issues: "report-issues",
  improvements: "report-improvements",
  copy: "report-copy",
  checklist: "report-checklist",
} as const;

export type ReportSectionKind = keyof typeof REPORT_SECTION_ANCHORS;

export const REPORT_SECTION_META: Record<
  ReportSectionKind,
  { title: string; lead: string }
> = {
  issues: {
    title: "UX Issues",
    lead: "Friction points ranked by impact on clarity, trust, and conversion.",
  },
  improvements: {
    title: "Suggested Improvements",
    lead: "Concrete changes to ship — ordered by expected UX lift.",
  },
  copy: {
    title: "Copy studio",
    lead: "Ready-to-paste copy for your highest-traffic elements.",
  },
  checklist: {
    title: "Checklist",
    lead: "What's working, what needs fixing, and quick wins — all in one place.",
  },
};
