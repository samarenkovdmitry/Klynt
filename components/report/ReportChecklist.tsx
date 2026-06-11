"use client";

import { useState } from "react";
import {
  RiErrorWarningFill,
  RiAlertFill,
  RiCheckboxCircleFill,
  RiListCheck3,
  RiEyeLine,
  RiEyeOffLine,
  RiArrowRightSLine,
} from "@remixicon/react";
import type { ReportChecklistItem, ChecklistLinkTarget } from "@/lib/audit-report";
import {
  REPORT_SECTION_SCROLL_MARGIN_CLASS,
  REPORT_SECTION_SPACING_CLASS,
} from "@/components/report/reportStyles";

// ---------------------------------------------------------------------------
// Design tokens (from docs/report-mvp-v4.html)
// --amber:#BA7517  --al:#FDF3E3  --ad:#7A4A0A
// --green:#1D9E75  --gl:#E8F7F2  --gd:#0F6E56
// --b1:rgba(0,0,0,.07)  --t1:#111  --t3:#999
// ---------------------------------------------------------------------------

const STATUS_CONFIG = {
  missing: {
    Icon: RiErrorWarningFill,
    iconColor: "text-[#BA7517]",
    badgeBg: "bg-[#FDF3E3]",
    badgeText: "text-[#7A4A0A]",
    badgeLabel: "Missing",
  },
  weak: {
    Icon: RiAlertFill,
    iconColor: "text-[#7B5EA7]",
    badgeBg: "bg-[#F5F0FB]",
    badgeText: "text-[#5B3F9A]",
    badgeLabel: "Weak",
  },
  pass: {
    Icon: RiCheckboxCircleFill,
    iconColor: "text-[#1D9E75]",
    badgeBg: "bg-[#E8F7F2]",
    badgeText: "text-[#0F6E56]",
    badgeLabel: "Pass",
  },
} as const;

const LINK_BUTTON_LABEL: Record<ChecklistLinkTarget, string> = {
  "copy-headline": "Fix copy",
  "copy-cta": "Fix copy",
  "copy-subheadline": "Fix copy",
  trust: "See trust",
  "visual-fixes": "Fix visual",
};

// ---------------------------------------------------------------------------
// Single row
// ---------------------------------------------------------------------------

function ChecklistRow({
  item,
  isLast,
}: {
  item: ReportChecklistItem;
  isLast: boolean;
}) {
  const { Icon, iconColor, badgeBg, badgeText, badgeLabel } =
    STATUS_CONFIG[item.status];
  const linkLabel =
    item.link_to && item.status !== "pass"
      ? LINK_BUTTON_LABEL[item.link_to]
      : null;

  function handleLinkClick() {
    if (!item.link_to) return;
    document
      .getElementById(item.link_to)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      className={[
        "flex items-center gap-2.5 py-[9px] text-[13px]",
        isLast ? "" : "border-b border-[rgba(0,0,0,0.07)]",
      ].join(" ")}
    >
      <Icon size={16} className={`shrink-0 ${iconColor}`} aria-hidden />

      <span className="flex-1 text-[#111] leading-[1.45]">{item.text}</span>

      {linkLabel ? (
        <button
          onClick={handleLinkClick}
          className="flex items-center gap-[3px] whitespace-nowrap text-[12px] text-[#1D9E75] transition-colors hover:underline"
        >
          <RiArrowRightSLine size={14} aria-hidden />
          {linkLabel}
        </button>
      ) : null}

      <span
        className={[
          "whitespace-nowrap rounded-full px-[9px] py-[3px] text-[11px] font-medium",
          badgeBg,
          badgeText,
        ].join(" ")}
      >
        {badgeLabel}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

type ReportChecklistProps = {
  checklist: ReportChecklistItem[];
};

export function ReportChecklist({ checklist }: ReportChecklistProps) {
  const [passVisible, setPassVisible] = useState(false);

  const gaps = [
    ...checklist.filter((item) => item.status === "missing"),
    ...checklist.filter((item) => item.status === "weak"),
  ];
  const passes = checklist.filter((item) => item.status === "pass");

  if (checklist.length === 0) return null;

  return (
    <section
      className={`${REPORT_SECTION_SPACING_CLASS} ${REPORT_SECTION_SCROLL_MARGIN_CLASS}`}
    >
      {/* Card */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_1px_rgba(0,0,0,0.04),0_4px_20px_rgba(0,0,0,0.07)]">

        {/* Section header — compact label row */}
        <div className="flex items-center justify-between px-5 pb-[10px] pt-[14px]">
          <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.07em] text-[#999]">
            <RiListCheck3 size={14} aria-hidden />
            What needs fixing
          </span>
          <span className="text-[12px] text-[#C0C0BC]">
            <span className="font-medium text-[#1D9E75]">{passes.length} pass</span>
            {" · "}
            <span className="font-medium text-[#E24B4A]">{gaps.length} gaps</span>
          </span>
        </div>

        {/* Gap rows */}
        {gaps.length > 0 && (
          <div className="px-5">
            {gaps.map((item, i) => (
              <ChecklistRow
                key={item.id}
                item={item}
                isLast={i === gaps.length - 1}
              />
            ))}
          </div>
        )}

        {/* Pass toggle */}
        {passes.length > 0 && (
          <>
            <button
              onClick={() => setPassVisible((v) => !v)}
              className="flex w-full items-center gap-1.5 border-t border-[rgba(0,0,0,0.07)] px-5 pb-[14px] pt-[10px] text-[12px] text-[#999] transition-colors hover:text-[#111]"
            >
              {passVisible ? (
                <RiEyeOffLine size={14} aria-hidden />
              ) : (
                <RiEyeLine size={14} aria-hidden />
              )}
              <span>
                {passVisible
                  ? "Hide passing checks"
                  : `Show ${passes.length} passing check${passes.length !== 1 ? "s" : ""}`}
              </span>
            </button>

            {/* Animated pass rows */}
            <div
              style={{
                maxHeight: passVisible ? `${passes.length * 44 + 8}px` : "0",
                overflow: "hidden",
                transition: "max-height 0.25s ease",
              }}
            >
              <div className="border-t border-[rgba(0,0,0,0.07)] px-5">
                {passes.map((item, i) => (
                  <ChecklistRow
                    key={item.id}
                    item={item}
                    isLast={i === passes.length - 1}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
