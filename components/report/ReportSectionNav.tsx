import {
  REPORT_SECTION_ANCHORS,
  REPORT_SECTION_META,
  type ReportSectionNavItem,
} from "@/lib/report-sections";

type ReportSectionNavProps = {
  items: ReportSectionNavItem[];
};

export function ReportSectionNav({ items }: ReportSectionNavProps) {
  if (items.length < 2) return null;

  return (
    <nav
      className="mt-8 flex flex-wrap justify-center gap-2"
      aria-label="Report sections"
    >
      {items.map(({ kind, count }) => {
        const meta = REPORT_SECTION_META[kind];

        return (
          <a
            key={kind}
            href={`#${REPORT_SECTION_ANCHORS[kind]}`}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(6,28,47,0.10)] bg-[#FAFBFC] px-4 py-2 text-[13px] font-medium text-[#061C2F] transition hover:border-[rgba(6,28,47,0.18)] hover:bg-white"
          >
            {meta.shortLabel}
            <span className="tabular-nums text-[#7D8C99]">{count}</span>
          </a>
        );
      })}
    </nav>
  );
}
