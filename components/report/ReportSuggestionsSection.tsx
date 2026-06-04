import type { ReportSuggestion } from "@/lib/audit-report";
import { PriorityBadgeFromImpact } from "@/components/report/ImpactBadges";
import { ReportSectionHeader } from "@/components/report/ReportSectionHeader";
import {
  REPORT_ACTION_HEADLINE_CLASS,
  REPORT_CONTEXT_LABEL_CLASS,
  REPORT_CARD_HEADLINE_BOTTOM_CLASS,
  REPORT_SECTION_LABEL_CLASS,
  REPORT_SECTION_SCROLL_MARGIN_CLASS,
  REPORT_SECTION_SPACING_CLASS,
  REPORT_WHY_BODY_CLASS,
  REPORT_WHY_DIVIDER_CLASS,
  getReportCardClass,
} from "@/components/report/reportStyles";
import { REPORT_SECTION_ANCHORS } from "@/lib/report-sections";
import { ReportIndexBadge } from "@/components/report/ReportIndexBadge";

type ReportSuggestionsSectionProps = {
  suggestions?: ReportSuggestion[];
  waitlistActive?: boolean;
};

function SuggestionCard({
  item,
  index,
  featured = false,
}: {
  item: ReportSuggestion;
  index: number;
  featured?: boolean;
}) {
  return (
    <div className={getReportCardClass("improvement", { featured })}>
      <div className="flex flex-col gap-5 md:flex-row md:gap-6">
        <div className="hidden items-start justify-center pt-0.5 md:flex">
          <ReportIndexBadge index={index} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-4 flex items-start justify-between gap-3 md:hidden">
                <ReportIndexBadge index={index} />
                <PriorityBadgeFromImpact item={item} className="justify-end" />
              </div>

              {item.section ? (
                <p className={REPORT_SECTION_LABEL_CLASS}>{item.section}</p>
              ) : null}
              <p
                className={[
                  REPORT_ACTION_HEADLINE_CLASS,
                  item.section ? "mt-2" : "",
                  item.why ? "" : REPORT_CARD_HEADLINE_BOTTOM_CLASS,
                ].join(" ")}
              >
                {item.recommendation}
              </p>
            </div>

            <div className="hidden shrink-0 md:block">
              <PriorityBadgeFromImpact item={item} />
            </div>
          </div>

          {item.why && (
            <div className={REPORT_WHY_DIVIDER_CLASS}>
              <p className={REPORT_CONTEXT_LABEL_CLASS}>Context</p>
              <p className={REPORT_WHY_BODY_CLASS}>{item.why}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReportSuggestionsSection({
  suggestions = [],
  waitlistActive = false,
}: ReportSuggestionsSectionProps) {
  if (suggestions.length === 0) return null;

  const visibleSuggestions = waitlistActive ? suggestions.slice(0, 1) : suggestions;

  return (
    <section
      id={REPORT_SECTION_ANCHORS.improvements}
      className={`${REPORT_SECTION_SPACING_CLASS} ${REPORT_SECTION_SCROLL_MARGIN_CLASS}`}
    >
      <ReportSectionHeader variant="improvements" count={suggestions.length} />

      <div className="mt-6 space-y-4">
        {visibleSuggestions.map((item, index) => (
          <SuggestionCard
            key={index}
            item={item}
            index={index}
            featured={index === 0}
          />
        ))}
      </div>
    </section>
  );
}
