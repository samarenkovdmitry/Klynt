"use client";

import { useState } from "react";
import {
  RiErrorWarningFill,
  RiAlertFill,
  RiCheckboxCircleFill,
  RiArrowDownSLine,
  RiEdit2Line,
  RiShieldLine,
  RiPaletteLine,
} from "@remixicon/react";
import type { ReportChecklistItem, ChecklistLinkTarget } from "@/lib/audit-report";
import {
  REPORT_SECTION_SCROLL_MARGIN_CLASS,
  REPORT_SECTION_SPACING_CLASS,
  REPORT_SECTION_TITLE_CLASS,
  REPORT_SURFACE_BORDER_CLASS,
  REPORT_SURFACE_SHADOW_CLASS,
} from "@/components/report/reportStyles";

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

const STATUS_CONFIG = {
  missing: {
    Icon: RiErrorWarningFill,
    iconColor: "text-[#B45309]",
    badgeBg: "bg-[#FDF3E3]",
    badgeText: "text-[#92400E]",
    label: "Missing",
  },
  weak: {
    Icon: RiAlertFill,
    iconColor: "text-[#7C3AED]",
    badgeBg: "bg-[#F5F3FF]",
    badgeText: "text-[#5B21B6]",
    label: "Weak",
  },
  pass: {
    Icon: RiCheckboxCircleFill,
    iconColor: "text-[#1D9E75]",
    badgeBg: "bg-[#E1F5EE]",
    badgeText: "text-[#0F6E56]",
    label: "Pass",
  },
} as const;

// ---------------------------------------------------------------------------
// Link-to action button config
// ---------------------------------------------------------------------------

const LINK_BUTTON_CONFIG: Record<
  ChecklistLinkTarget,
  { label: string; Icon: typeof RiEdit2Line }
> = {
  "copy-headline": { label: "Fix copy", Icon: RiEdit2Line },
  "copy-cta": { label: "Fix copy", Icon: RiEdit2Line },
  "copy-subheadline": { label: "Fix copy", Icon: RiEdit2Line },
  trust: { label: "See trust", Icon: RiShieldLine },
  "visual-fixes": { label: "Fix visual", Icon: RiPaletteLine },
};

function scrollToAnchor(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------------------------------------------------------------------------
// Single checklist row
// ---------------------------------------------------------------------------

function ChecklistRow({
  item,
  dimmed = false,
}: {
  item: ReportChecklistItem;
  dimmed?: boolean;
}) {
  const { Icon, iconColor, badgeBg, badgeText, label } = STATUS_CONFIG[item.status];
  const linkCfg = item.link_to ? LINK_BUTTON_CONFIG[item.link_to] : null;

  return (
    <div
      className={[
        "flex items-center justify-between gap-3 px-5 py-4 md:px-6",
        dimmed ? "bg-[rgba(6,28,47,0.015)]" : "",
      ].join(" ")}
    >
      {/* Left: icon + text */}
      <div className="flex min-w-0 items-center gap-3">
        <Icon size={17} className={`shrink-0 ${iconColor}`} aria-hidden />
        <span
          className={[
            "text-[14px] leading-[20px] md:text-[15px]",
            dimmed ? "text-[rgba(6,28,47,0.55)]" : "text-[#061C2F]",
          ].join(" ")}
        >
          {item.text}
        </span>
      </div>

      {/* Right: action button + badge */}
      <div className="flex shrink-0 items-center gap-2">
        {linkCfg && item.status !== "pass" ? (
          <button
            onClick={() => scrollToAnchor(item.link_to!)}
            className="flex items-center gap-1.5 rounded-lg border border-[rgba(6,28,47,0.10)] bg-white px-3 py-1.5 text-[12px] font-medium text-[#3B7FC4] transition-colors hover:border-[rgba(59,127,196,0.3)] hover:bg-[#F0F7FF]"
          >
            <linkCfg.Icon size={13} aria-hidden />
            {linkCfg.label}
          </button>
        ) : null}
        <span
          className={[
            "rounded-md px-[9px] py-[3px] text-[11px] font-medium leading-[18px]",
            badgeBg,
            badgeText,
          ].join(" ")}
        >
          {label}
        </span>
      </div>
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

  const gaps = checklist.filter(
    (item) => item.status === "missing" || item.status === "weak"
  );
  const passes = checklist.filter((item) => item.status === "pass");

  if (checklist.length === 0) return null;

  return (
    <section
      className={`${REPORT_SECTION_SPACING_CLASS} ${REPORT_SECTION_SCROLL_MARGIN_CLASS}`}
    >
      <h3 className={REPORT_SECTION_TITLE_CLASS}>What needs fixing</h3>
      <p className="mt-1 text-[14px] leading-[21px] text-[rgba(6,28,47,0.5)] md:text-[15px]">
        {gaps.length} gap{gaps.length !== 1 ? "s" : ""} found · ranked by priority
      </p>

      <div
        className={[
          "mt-6 overflow-hidden rounded-[18px] bg-white",
          REPORT_SURFACE_BORDER_CLASS,
          REPORT_SURFACE_SHADOW_CLASS,
        ].join(" ")}
      >
        {/* Gap rows */}
        {gaps.map((item, i) => (
          <div
            key={item.id}
            className={
              i < gaps.length - 1 || passes.length > 0
                ? "border-b border-[rgba(6,28,47,0.06)]"
                : ""
            }
          >
            <ChecklistRow item={item} />
          </div>
        ))}

        {/* Pass items toggle + rows */}
        {passes.length > 0 && (
          <>
            <button
              onClick={() => setPassVisible((v) => !v)}
              className="flex w-full items-center justify-between gap-2 px-5 py-3.5 text-left transition-colors hover:bg-[rgba(6,28,47,0.02)] md:px-6"
            >
              <span className="text-[13px] font-medium text-[rgba(6,28,47,0.4)]">
                {passVisible
                  ? "Hide passing checks"
                  : `Show ${passes.length} passing check${passes.length !== 1 ? "s" : ""}`}
              </span>
              <RiArrowDownSLine
                size={16}
                className={[
                  "shrink-0 text-[rgba(6,28,47,0.3)] transition-transform duration-200",
                  passVisible ? "rotate-180" : "",
                ].join(" ")}
                aria-hidden
              />
            </button>

            {passVisible &&
              passes.map((item) => (
                <div key={item.id} className="border-t border-[rgba(6,28,47,0.06)]">
                  <ChecklistRow item={item} dimmed />
                </div>
              ))}
          </>
        )}
      </div>
    </section>
  );
}
