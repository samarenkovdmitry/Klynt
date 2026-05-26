import type { ReportSuggestion } from "@/lib/audit-report";
import { ReportListCard } from "@/components/report/ReportListCard";
import { REPORT_SECTION_TITLE_CLASS } from "@/components/report/reportStyles";
import { getImpactEntries } from "@/lib/report-impact";

type ReportSuggestionsSectionProps = {
  suggestions?: ReportSuggestion[];
};

export function ReportSuggestionsSection({
  suggestions = [],
}: ReportSuggestionsSectionProps) {
  if (suggestions.length === 0) return null;

  return (
    <section>
      <h3 className={`${REPORT_SECTION_TITLE_CLASS} mb-5 min-w-0 shrink`}>
        Suggested Improvements
      </h3>

      <div className="space-y-4">
        {suggestions.map((item, index) => {
          const impactEntries = getImpactEntries(item);

          return (
            <ReportListCard
              key={index}
              index={index}
              title={item.section ?? ""}
              impactEntries={impactEntries}
              impactVariant="positive"
              animated
            >
              <p className="mt-3 text-[16px] leading-7 text-[var(--ink-primary)] md:text-[18px]">
                {item.recommendation}
              </p>

              {item.why && (
                <div className="mt-6 border-t border-neutral-100 pt-5">
                  <p className="text-[14px] font-semibold text-[var(--ink-primary)]">
                    Why it works
                  </p>
                  <p className="mt-1 text-[15px] leading-6 text-[var(--ink-secondary)]">
                    {item.why}
                  </p>
                </div>
              )}
            </ReportListCard>
          );
        })}
      </div>
    </section>
  );
}
