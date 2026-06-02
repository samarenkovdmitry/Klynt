"use client";

import type { ReportSuggestion } from "@/lib/audit-report";
import { PriorityBadgeFromImpact } from "@/components/report/ImpactBadges";
import { ReportLockedSkeletonCard } from "@/components/report/ReportLockedSkeletons";
import { ReportSectionHeader } from "@/components/report/ReportSectionHeader";
import {
  REPORT_CARD_HEADLINE_BOTTOM_CLASS,
  REPORT_CARD_CLASS_ANIMATED,
  REPORT_CARD_HEADLINE_CLASS,
  REPORT_SECTION_LABEL_CLASS,
  REPORT_SECTION_SPACING_CLASS,
  REPORT_WHY_BODY_CLASS,
  REPORT_WHY_DIVIDER_CLASS,
  REPORT_WHY_LABEL_CLASS,
} from "@/components/report/reportStyles";
import { ReportIndexBadge } from "@/components/report/ReportIndexBadge";

type ReportSuggestionsSectionProps = {
  suggestions?: ReportSuggestion[];
  waitlistActive?: boolean;
};

function SuggestionCard({
  item,
  index,
}: {
  item: ReportSuggestion;
  index: number;
}) {
  return (
    <div className={REPORT_CARD_CLASS_ANIMATED}>
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
                className={`${REPORT_CARD_HEADLINE_CLASS} ${item.section ? "mt-2" : ""} ${REPORT_CARD_HEADLINE_BOTTOM_CLASS}`}
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
              <p className={REPORT_WHY_LABEL_CLASS}>Why it matters</p>
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
  const lockedSuggestionCount = waitlistActive
    ? Math.max(0, suggestions.length - 1)
    : 0;

  return (
    <section className={REPORT_SECTION_SPACING_CLASS}>
      <ReportSectionHeader title="Suggested Improvements" count={suggestions.length} />

      <div className="mt-5 space-y-4">
        {visibleSuggestions.map((item, index) => (
          <SuggestionCard key={index} item={item} index={index} />
        ))}

        {Array.from({ length: lockedSuggestionCount }, (_, offset) => (
          <ReportLockedSkeletonCard
            key={`locked-suggestion-${offset}`}
            index={offset + 1}
          />
        ))}
      </div>
    </section>
  );
}
