"use client";

import type { ReportSuggestion } from "@/lib/audit-report";
import { ReportListCard } from "@/components/report/ReportListCard";
import { PreLaunchWaitlistCard } from "@/components/pre-launch/PreLaunchWaitlist";
import { REPORT_SECTION_TITLE_CLASS } from "@/components/report/reportStyles";
import { getImpactEntries } from "@/lib/report-impact";

type ReportSuggestionsSectionProps = {
  suggestions?: ReportSuggestion[];
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
  const impactEntries = getImpactEntries(item);

  return (
    <ReportListCard
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
}

export function ReportSuggestionsSection({
  suggestions = [],
  waitlistActive = false,
  onWaitlistUnlock,
}: ReportSuggestionsSectionProps) {
  if (suggestions.length === 0) return null;

  const [firstSuggestion, ...restSuggestions] = suggestions;
  const showWaitlistGate = waitlistActive && Boolean(onWaitlistUnlock);
  const blurredSuggestions = restSuggestions.slice(0, 2);

  return (
    <section>
      <h3 className={`${REPORT_SECTION_TITLE_CLASS} mb-5 min-w-0 shrink`}>
        Suggested Improvements
      </h3>

      <div className="space-y-4">
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
