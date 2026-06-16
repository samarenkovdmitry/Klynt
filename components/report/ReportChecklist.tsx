"use client";

import { useState } from "react";
import {
  RiAlertFill,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiCheckboxCircleFill,
  RiErrorWarningFill,
  RiLayoutColumnLine,
} from "@remixicon/react";
import type { ReportChecklistItem, ChecklistLinkTarget } from "@/lib/audit-report";
import { getChecklistBadgeLabel } from "@/lib/normalize-report-checklist";
import {
  REPORT_PANEL_HEADER_CLASS,
  REPORT_PANEL_META_CLASS,
  REPORT_PANEL_TITLE_CLASS,
  REPORT_ROW_DIVIDER_CLASS,
  REPORT_SECTION_SCROLL_MARGIN_CLASS,
  REPORT_SECTION_SPACING_CLASS,
  REPORT_SURFACE_CARD_CLASS,
} from "@/components/report/reportStyles";

const STATUS_CONFIG = {
  missing: {
    Icon: RiErrorWarningFill,
    iconColor: "text-[#BA7517]",
    badgeBg: "bg-[#FDF3E3]",
    badgeText: "text-[#7A4A0A]",
  },
  weak: {
    Icon: RiAlertFill,
    iconColor: "text-[#7B5EA7]",
    badgeBg: "bg-[#F5F0FB]",
    badgeText: "text-[#5B3F9A]",
  },
  pass: {
    Icon: RiCheckboxCircleFill,
    iconColor: "text-[#1D9E75]",
    badgeBg: "bg-[#E8F7F2]",
    badgeText: "text-[#0F6E56]",
  },
} as const;

const LINK_BUTTON_LABEL: Record<ChecklistLinkTarget, string> = {
  "copy-headline": "Fix copy",
  "copy-cta": "Fix copy",
  "copy-subheadline": "Fix copy",
  trust: "See trust",
  "visual-fixes": "Fix visual",
  "structure-nav": "See layout",
  "hero-density": "Fix visual",
};

const LINK_ANCHOR: Record<ChecklistLinkTarget, string> = {
  "copy-headline": "copy-headline",
  "copy-cta": "copy-cta",
  "copy-subheadline": "copy-subheadline",
  trust: "trust",
  "visual-fixes": "visual-fixes",
  "structure-nav": "visual-fixes",
  "hero-density": "visual-fixes",
};

function ChecklistRow({
  item,
  isLast,
}: {
  item: ReportChecklistItem;
  isLast: boolean;
}) {
  const { Icon, iconColor, badgeBg, badgeText } = STATUS_CONFIG[item.status];
  const badgeLabel = getChecklistBadgeLabel(item);
  const linkLabel =
    item.link_to && item.status !== "pass" ? LINK_BUTTON_LABEL[item.link_to] : null;

  function handleLinkClick() {
    if (!item.link_to) return;
    document.getElementById(LINK_ANCHOR[item.link_to])?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div
      className={[
        "group flex items-center gap-2.5 py-4 text-[14px] leading-5",
        isLast ? "" : REPORT_ROW_DIVIDER_CLASS,
      ].join(" ")}
    >
      <Icon size={16} className={`shrink-0 ${iconColor}`} aria-hidden />

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="text-[#061C2F]">{item.text}</span>

        {linkLabel ? (
          <button
            type="button"
            onClick={handleLinkClick}
            className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[13px] text-[#8E99A2] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          >
            <RiArrowRightSLine size={14} aria-hidden />
            {linkLabel}
          </button>
        ) : null}
      </div>

      <span
        className={[
          "shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium leading-4",
          badgeBg,
          badgeText,
        ].join(" ")}
      >
        {badgeLabel}
      </span>
    </div>
  );
}

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
      <div className={REPORT_SURFACE_CARD_CLASS}>
        <div className={REPORT_PANEL_HEADER_CLASS}>
          <div className={REPORT_PANEL_TITLE_CLASS}>
            <RiLayoutColumnLine size={20} className="text-[#7D8C99]" aria-hidden />
            What needs fixing
          </div>
          <span className={REPORT_PANEL_META_CLASS}>
            {gaps.length} gap{gaps.length === 1 ? "" : "s"}
          </span>
        </div>

        {gaps.length > 0 ? (
          <div className="px-5 pt-2 md:px-6">
            {gaps.map((item, index) => (
              <ChecklistRow
                key={item.id}
                item={item}
                isLast={index === gaps.length - 1 && passes.length === 0}
              />
            ))}
          </div>
        ) : null}

        {passes.length > 0 ? (
          <>
            <button
              type="button"
              onClick={() => setPassVisible((value) => !value)}
              className={[
                "flex w-full items-center gap-1.5 px-5 py-3.5 text-[13px] text-[#7D8C99] transition-colors hover:text-[#061C2F] md:px-6",
                gaps.length > 0 ? `border-t ${REPORT_ROW_DIVIDER_CLASS.replace("border-b ", "")}` : "",
              ].join(" ")}
            >
              <RiArrowDownSLine
                size={16}
                aria-hidden
                className={`transition-transform duration-300 ${passVisible ? "rotate-180" : ""}`}
              />
              {passVisible
                ? "Hide passing checks"
                : `Show ${passes.length} passing check${passes.length === 1 ? "" : "s"}`}
            </button>

            <div
              className="overflow-hidden transition-[max-height] duration-300 ease-out"
              style={{
                maxHeight: passVisible ? `${passes.length * 48 + 8}px` : "0px",
              }}
            >
              <div
                className={[
                  "px-5 md:px-6",
                  gaps.length > 0 || passVisible
                    ? `border-t ${REPORT_ROW_DIVIDER_CLASS.replace("border-b ", "")}`
                    : "",
                ].join(" ")}
              >
                {passes.map((item, index) => (
                  <ChecklistRow
                    key={item.id}
                    item={item}
                    isLast={index === passes.length - 1}
                  />
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
