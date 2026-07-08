"use client";

import { useState } from "react";
import type {
  ChecklistCategory,
  ChecklistItemStatus,
  ReportChecklistItem,
} from "@/lib/audit-report";
import { ReportSectionHeader } from "@/components/report/ReportSectionHeader";
import { ReportVariantCard } from "@/components/report/ReportVariantCard";
import { ReportIndexBadge } from "@/components/report/ReportIndexBadge";
import {
  REPORT_CARD_TITLE_CLASS,
  REPORT_SECTION_SCROLL_MARGIN_CLASS,
  REPORT_WHY_BODY_CLASS,
  REPORT_WHY_BODY_MEASURE_CLASS,
  REPORT_WHY_DIVIDER_CLASS,
} from "@/components/report/reportStyles";
import { REPORT_SECTION_ANCHORS } from "@/lib/report-sections";

type ReportChecklistSectionProps = {
  checklist?: ReportChecklistItem[];
  waitlistActive?: boolean;
};

const STATUS_LABEL: Record<ChecklistItemStatus, string> = {
  missing: "Critical gap",
  weak: "Needs work",
  pass: "Looks good",
};

const STATUS_BADGE_CLASS: Record<ChecklistItemStatus, string> = {
  missing: "border-[#F9D5D5] bg-[#FFEFEF] text-[#FF5A4F]",
  weak: "border-[#FCE664] bg-[#FEFCE8] text-[#D08700]",
  pass: "border-emerald-200 bg-[#ECFDF5] text-[#10B981]",
};

const CATEGORY_LABEL: Record<ChecklistCategory, string> = {
  copy: "Copy",
  trust: "Trust",
  visual: "Visual",
  structure: "Structure",
};

const BADGE_PILL_CLASS =
  "inline-flex h-[37px] shrink-0 items-center rounded-full border px-[15px] text-[13px] font-semibold leading-[19.5px]";

const IMPACT_SCORE_BADGE_CLASS =
  "font-mono inline-flex h-[37px] shrink-0 items-center rounded-full border border-[rgba(6,28,47,0.10)] bg-white px-[13px] text-[13px] font-semibold tabular-nums text-[#616C77]";

function ChecklistRow({
  item,
  index,
  expanded,
  onToggle,
}: {
  item: ReportChecklistItem;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const expandable = Boolean(
    item.body || item.why_it_matters_here || item.reasoning_chain
  );

  return (
    <ReportVariantCard variant="issue">
      <div
        className={`flex flex-col gap-5 md:flex-row md:gap-6 ${expandable ? "cursor-pointer" : ""}`}
        onClick={() => expandable && onToggle()}
      >
        <div className="hidden items-start justify-center pt-0.5 md:flex">
          <ReportIndexBadge index={index} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-4 flex items-start justify-between gap-3 md:hidden">
                <ReportIndexBadge index={index} />
                <div className="flex items-center gap-2">
                  <span className={`${BADGE_PILL_CLASS} ${STATUS_BADGE_CLASS[item.status]}`}>
                    {STATUS_LABEL[item.status]}
                  </span>
                  {typeof item.impact_score === "number" && (
                    <span className={IMPACT_SCORE_BADGE_CLASS} aria-label="Impact score">
                      {item.impact_score}
                    </span>
                  )}
                </div>
              </div>

              <p className={REPORT_CARD_TITLE_CLASS}>{item.text}</p>
              {item.evidence && (
                <p className="mt-1 text-[13px] leading-5 text-[#7D8C99]">{item.evidence}</p>
              )}
            </div>

            <div className="hidden shrink-0 md:flex md:items-center md:gap-2">
              <span
                className={`${BADGE_PILL_CLASS} border-[rgba(6,28,47,0.10)] bg-white text-[#616C77]`}
              >
                {CATEGORY_LABEL[item.category]}
              </span>
              <span className={`${BADGE_PILL_CLASS} ${STATUS_BADGE_CLASS[item.status]}`}>
                {STATUS_LABEL[item.status]}
              </span>
              {typeof item.impact_score === "number" && (
                <span className={IMPACT_SCORE_BADGE_CLASS} aria-label="Impact score">
                  {item.impact_score}
                </span>
              )}
            </div>
          </div>

          {expanded && item.body && (
            <div className={REPORT_WHY_DIVIDER_CLASS}>
              <p className={`${REPORT_WHY_BODY_CLASS} ${REPORT_WHY_BODY_MEASURE_CLASS}`}>
                {item.body}
              </p>
            </div>
          )}

          {expanded && item.why_it_matters_here && (
            <p className={`mt-3 ${REPORT_WHY_BODY_CLASS} ${REPORT_WHY_BODY_MEASURE_CLASS}`}>
              <span className="font-semibold text-[var(--ink-primary)]">Why it matters here: </span>
              {item.why_it_matters_here}
            </p>
          )}

          {expanded && item.reasoning_chain && (
            <div className={`mt-3 flex flex-col gap-1 ${REPORT_WHY_BODY_MEASURE_CLASS}`}>
              <p className={REPORT_WHY_BODY_CLASS}>
                <span className="font-semibold text-[var(--ink-primary)]">Sees: </span>
                {item.reasoning_chain.sees}
              </p>
              <p className={REPORT_WHY_BODY_CLASS}>
                <span className="font-semibold text-[var(--ink-primary)]">Infers: </span>
                {item.reasoning_chain.infers}
              </p>
              <p className={REPORT_WHY_BODY_CLASS}>
                <span className="font-semibold text-[var(--ink-primary)]">Decides: </span>
                {item.reasoning_chain.decides}
              </p>
            </div>
          )}
        </div>
      </div>
    </ReportVariantCard>
  );
}

export function ReportChecklistSection({
  checklist = [],
  waitlistActive = false,
}: ReportChecklistSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  if (checklist.length === 0) return null;

  const visibleItems = waitlistActive ? checklist.slice(0, 1) : checklist;
  const lockedCount = waitlistActive ? Math.max(0, checklist.length - 1) : 0;

  function toggle(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section
      id={REPORT_SECTION_ANCHORS.checklist}
      className={`mt-10 ${REPORT_SECTION_SCROLL_MARGIN_CLASS}`}
    >
      <ReportSectionHeader variant="checklist" count={checklist.length} />

      <div className="mt-6 space-y-4">
        {visibleItems.map((item, index) => (
          <ChecklistRow
            key={item.id}
            item={item}
            index={index}
            expanded={expandedIds.has(item.id)}
            onToggle={() => toggle(item.id)}
          />
        ))}

        {lockedCount > 0 && (
          <p className="px-1 text-[14px] leading-5 text-[rgba(6,28,47,0.45)]">
            +{lockedCount} more finding{lockedCount === 1 ? "" : "s"} in the full
            report
          </p>
        )}
      </div>
    </section>
  );
}
