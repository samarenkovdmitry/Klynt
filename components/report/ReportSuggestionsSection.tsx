"use client";

import type { ReportSuggestion } from "@/lib/audit-report";
import { PriorityBadgeFromImpact } from "@/components/report/ImpactBadges";
import { ReportSectionHeader } from "@/components/report/ReportSectionHeader";
import { PreLaunchWaitlistCard } from "@/components/pre-launch/PreLaunchWaitlist";
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
  reportId?: string;
  waitlistActive?: boolean;
  onWaitlistUnlock?: () => void;
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
  reportId,
  waitlistActive = false,
  onWaitlistUnlock,
}: ReportSuggestionsSectionProps) {
  if (suggestions.length === 0) return null;

  const [firstSuggestion, ...restSuggestions] = suggestions;
  const showWaitlistGate =
    waitlistActive && Boolean(onWaitlistUnlock) && Boolean(reportId);
  const blurredSuggestions = restSuggestions.slice(0, 2);

  return (
    <section className={REPORT_SECTION_SPACING_CLASS}>
      <ReportSectionHeader title="Suggested Improvements" count={suggestions.length} />

      <div className="mt-5 space-y-4">
        <SuggestionCard item={firstSuggestion} index={0} />

        {showWaitlistGate ? (
          <div className="relative h-[500px] overflow-hidden">
            {blurredSuggestions.length > 0 && (
              <>
                <div
                  className="absolute inset-x-0 top-0 space-y-4 blur-[5px] opacity-55 pointer-events-none select-none"
                  aria-hidden
                >
                  {blurredSuggestions.map((item, index) => (
                    <SuggestionCard
                      key={index + 1}
                      item={item}
                      index={index + 1}
                    />
                  ))}
                </div>

                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(245,247,250,0) 0%, rgba(245,247,250,0.55) 45%, #F5F7FA 100%)",
                  }}
                />
              </>
            )}

            <div className="absolute inset-0 z-10 flex items-center justify-center px-4 py-6">
              <div className="w-full max-w-[560px]">
                <PreLaunchWaitlistCard
                  reportId={reportId!}
                  overlay
                  onUnlock={onWaitlistUnlock!}
                />
              </div>
            </div>
          </div>
        ) : (
          restSuggestions.map((item, index) => (
            <SuggestionCard key={index + 1} item={item} index={index + 1} />
          ))
        )}
      </div>
    </section>
  );
}
