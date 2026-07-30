"use client";

import { useState } from "react";
import { RiArrowDownLine, RiArrowDownSLine, RiArrowUpLine, RiBarChartLine } from "@remixicon/react";
import type { ReportChecklistItem, ReportScorePotential } from "@/lib/audit-report";
import {
  REPORT_NEW_SECTION_BODY_GAP_CLASS,
  ReportNewSectionHeader,
} from "@/components/report/ReportNewSectionHeader";
import {
  REPORT_SECTION_SCROLL_MARGIN_CLASS,
  REPORT_SECTION_SPACING_CLASS,
  REPORT_SURFACE_CARD_CLASS,
} from "@/components/report/reportStyles";

type ReportCloseTheGapProps = {
  score: number;
  scorePotential: ReportScorePotential;
  checklist?: ReportChecklistItem[];
};

function formatScore(value: number) {
  return value.toFixed(1);
}

function sortChecklistByImpact(items: ReportChecklistItem[]) {
  return [...items].sort((a, b) => {
    const aPass = a.status === "pass";
    const bPass = b.status === "pass";
    if (aPass !== bPass) return aPass ? 1 : -1;
    return (b.impact_score ?? 0) - (a.impact_score ?? 0);
  });
}

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
  const expandable = Boolean(item.body || item.why_it_matters_here || item.fix);
  const explanation = [item.body, item.why_it_matters_here].filter(Boolean).join(" ");

  return (
    <div
      className={`px-[21px] py-5 md:px-[33px] md:py-5 ${expandable ? "cursor-pointer" : ""}`}
      onClick={() => expandable && onToggle()}
    >
      <div className="flex items-center gap-3 md:gap-4">
        <span className="w-5 shrink-0 text-[16px] font-medium tabular-nums leading-5 text-[#8E99A2]">
          {index + 1}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[18px] font-semibold leading-6 tracking-[-0.02em] text-[var(--ink-primary)] md:text-[20px] md:leading-7">
            {item.text}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {typeof item.delta === "number" ? (
            <span className="inline-flex h-[27px] items-center gap-1 rounded-full bg-[rgba(29,158,117,0.07)] px-3 text-[13px] font-semibold text-[#1D9E75]">
              {item.delta >= 0 ? (
                <RiArrowUpLine size={14} aria-hidden />
              ) : (
                <RiArrowDownLine size={14} aria-hidden />
              )}
              {item.delta.toFixed(1)}
            </span>
          ) : null}

          {expandable ? (
            <RiArrowDownSLine
              size={18}
              aria-hidden
              className={`shrink-0 text-[#8E99A2] transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            />
          ) : null}
        </div>
      </div>

      {expanded && explanation ? (
        <p className="mt-3 pl-8 text-[15px] leading-[21px] text-[rgba(6,28,47,0.6)] md:pl-9">
          {explanation}
        </p>
      ) : null}

      {expanded && item.fix ? (
        <p className="mt-2 pl-8 text-[15px] leading-[21px] text-[#061C2F] md:pl-9">
          <span className="font-semibold">Fix: </span>
          {item.fix}
        </p>
      ) : null}
    </div>
  );
}

export function ReportCloseTheGap({
  score,
  scorePotential,
  checklist = [],
}: ReportCloseTheGapProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const issues = sortChecklistByImpact(checklist).filter((item) => item.status !== "pass");
  if (issues.length === 0) return null;

  const { target } = scorePotential;

  function toggle(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section className={`${REPORT_SECTION_SPACING_CLASS} ${REPORT_SECTION_SCROLL_MARGIN_CLASS}`}>
      <ReportNewSectionHeader
        icon={<RiBarChartLine size={22} className="text-[#5B6378]" />}
        title="Close the gap"
        suffix={`${formatScore(score)} → ${formatScore(target)}`}
      />

      <div className={`${REPORT_NEW_SECTION_BODY_GAP_CLASS} ${REPORT_SURFACE_CARD_CLASS}`}>
        <div className="divide-y divide-[rgba(6,28,47,0.06)]">
          {issues.map((item, index) => (
            <ChecklistRow
              key={item.id}
              item={item}
              index={index}
              expanded={expandedIds.has(item.id)}
              onToggle={() => toggle(item.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
