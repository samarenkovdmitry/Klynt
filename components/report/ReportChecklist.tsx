"use client";

import { useState } from "react";
import {
  RiAlertFill,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiArrowUpSLine,
  RiCheckboxCircleFill,
  RiErrorWarningFill,
  RiListCheck3,
} from "@remixicon/react";
import type { ReportChecklistItem, ChecklistLinkTarget } from "@/lib/audit-report";
import { getChecklistBadgeLabel } from "@/lib/normalize-report-checklist";
import { ReportSectionShell } from "@/components/report/ReportSectionShell";
import { REPORT_ROW_DIVIDER_CLASS } from "@/components/report/reportStyles";

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
    iconColor: "text-[#10B981]",
    badgeBg: "bg-[#ECFDF5]",
    badgeText: "text-[#059669]",
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
        "flex items-start gap-3 px-5 py-4 md:px-6",
        isLast ? "" : REPORT_ROW_DIVIDER_CLASS,
      ].join(" ")}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${iconColor}`} aria-hidden />

      <div className="min-w-0 flex-1">
        <p className="text-[16px] leading-6 text-[#061C2F]">{item.text}</p>
        {linkLabel ? (
          <button
            type="button"
            onClick={handleLinkClick}
            className="mt-1 inline-flex items-center gap-0.5 text-[14px] font-medium text-[#10B981] transition-opacity hover:opacity-80"
          >
            <RiArrowRightSLine size={16} aria-hidden />
            {linkLabel}
          </button>
        ) : null}
      </div>

      <span
        className={[
          "shrink-0 rounded-full px-2.5 py-1 text-[13px] font-semibold leading-[19.5px]",
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
    <ReportSectionShell
      icon={<RiListCheck3 size={20} aria-hidden />}
      title="What needs fixing"
      meta={`${gaps.length} gap${gaps.length === 1 ? "" : "s"}`}
    >
      {gaps.map((item, index) => (
        <ChecklistRow key={item.id} item={item} isLast={index === gaps.length - 1 && !passes.length} />
      ))}

      {passes.length > 0 ? (
        <>
          <button
            type="button"
            onClick={() => setPassVisible((value) => !value)}
            className={[
              "flex w-full items-center justify-center gap-1.5 px-5 py-3.5 text-[14px] text-[#7D8C99] transition-colors hover:text-[#061C2F]",
              gaps.length > 0 ? `border-t ${REPORT_ROW_DIVIDER_CLASS.replace("border-b ", "")}` : "",
            ].join(" ")}
          >
            {passVisible ? <RiArrowUpSLine size={16} aria-hidden /> : <RiArrowDownSLine size={16} aria-hidden />}
            {passVisible
              ? "Hide passing checks"
              : `Show ${passes.length} passing check${passes.length === 1 ? "" : "s"}`}
          </button>

          {passVisible
            ? passes.map((item, index) => (
                <ChecklistRow
                  key={item.id}
                  item={item}
                  isLast={index === passes.length - 1}
                />
              ))
            : null}
        </>
      ) : null}
    </ReportSectionShell>
  );
}
