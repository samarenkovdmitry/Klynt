"use client";

import {
  RiAlarmWarningLine,
  RiCloseCircleFill,
  RiRocket2Line,
  RiCheckboxCircleFill,
} from "@remixicon/react";
import type { ReportChecklistItem, ReportCopyVariants } from "@/lib/audit-report";

type HeroMode = "critical" | "opportunity";

type Props = {
  checklist: ReportChecklistItem[];
  copyVariants?: ReportCopyVariants | null;
  viewportWidth?: number;
};

// Exported so ReportPageV2 can read the chosen id for deduplication in ReportPriorityQueue.
export function pickHeroFinding(
  checklist: ReportChecklistItem[]
): { finding: ReportChecklistItem; mode: HeroMode } | null {
  const issues = checklist.filter((i) => i.status !== "pass");
  if (issues.length === 0) return null;

  const critical = issues.find((i) => i.status === "missing");
  if (critical) return { finding: critical, mode: "critical" };

  // No critical — highest impact is the first weak item (list is already sorted by impact).
  return { finding: issues[0], mode: "opportunity" };
}

function getLinkedCopy(
  item: ReportChecklistItem,
  copyVariants: ReportCopyVariants
): { before: string; after: string } | null {
  const map = {
    "copy-headline": copyVariants.headline,
    "copy-subheadline": copyVariants.subheadline,
    "copy-cta": copyVariants.cta,
  } as const;

  if (!item.link_to || !(item.link_to in map)) return null;
  const block = map[item.link_to as keyof typeof map];
  if (!block?.current || !block.variants?.[0]?.text) return null;
  return { before: block.current, after: block.variants[0].text };
}

function isViewportOrPerformanceItem(item: ReportChecklistItem): boolean {
  const id = item.id.toLowerCase();
  const text = item.text.toLowerCase();
  const evidence = item.evidence?.toLowerCase() ?? "";
  return (
    id.includes("viewport") ||
    id.includes("performance") ||
    text.includes("viewport") ||
    evidence.includes("viewport")
  );
}

// ─── Inline viewport scale ────────────────────────────────────────────────────

const SCALE_MIN = 320;
const SCALE_MAX = 1440;

function scalePct(px: number) {
  return Math.max(0, Math.min(100, ((px - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100));
}

const SCALE_LABELS = [
  { px: 375, label: "Mobile" },
  { px: 768, label: "Tablet" },
  { px: 1280, label: "Desktop" },
] as const;

function ViewportScale({ viewportWidth }: { viewportWidth: number }) {
  const pTablet  = scalePct(768);
  const pCurrent = scalePct(viewportWidth);
  const greenLeft  = scalePct(375);
  const greenWidth = pTablet - greenLeft;
  const redWidth   = Math.max(0, pCurrent - pTablet);
  const ratio = (viewportWidth / 375).toFixed(1);

  return (
    <div>
      <span className="font-mono mb-4 block text-[10.5px] uppercase tracking-[0.08em] text-v2-ink-muted">
        Viewport Width
      </span>

      {/* "← current" label above the marker dot */}
      <div className="relative mb-1 h-[14px]">
        <span
          className="font-mono absolute whitespace-nowrap text-[10px] font-semibold text-[#EF4444]"
          style={{ left: `${pCurrent}%`, transform: "translateX(-50%)" }}
        >
          ← current
        </span>
      </div>

      {/* Track */}
      <div className="relative h-[7px] rounded-full bg-[rgba(0,0,0,0.06)]">
        {/* Green zone: Mobile → Tablet */}
        <div
          className="absolute h-full rounded-full bg-[#4CAF50]"
          style={{ left: `${greenLeft}%`, width: `${greenWidth}%` }}
        />
        {/* Red zone: Tablet → current */}
        {redWidth > 0 && (
          <div
            className="absolute h-full bg-[#EF4444]"
            style={{
              left: `${pTablet}%`,
              width: `${redWidth}%`,
              borderRadius: "0 9999px 9999px 0",
            }}
          />
        )}
        {/* Marker dot */}
        <div
          className="absolute top-1/2 h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#EF4444] bg-white shadow-sm"
          style={{ left: `${pCurrent}%` }}
        />
      </div>

      {/* Breakpoint labels — no px numbers */}
      <div className="relative mt-2 h-[18px]">
        {SCALE_LABELS.map(({ px, label }) => (
          <span
            key={px}
            className="font-mono absolute -translate-x-1/2 text-[10px] text-v2-ink-muted"
            style={{ left: `${scalePct(px)}%` }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Caption */}
      <p className="mt-3 text-[13.5px] leading-[1.55] text-v2-ink-secondary">
        Mobile visitors see your page at{" "}
        <span className="font-semibold text-[#EF4444]">{viewportWidth}px</span>
        {" — "}
        <span className="font-semibold">{ratio}×</span> wider than their screen
      </p>
    </div>
  );
}

// ─── Hero badge ───────────────────────────────────────────────────────────────

function HeroBadge({ isCritical }: { isCritical: boolean }) {
  if (isCritical) {
    return (
      <span className="font-mono mb-6 inline-flex items-center gap-2 rounded-full bg-v2-critical-bg px-[13px] py-[7px] text-[11.5px] tracking-[0.1em] text-v2-critical">
        <RiAlarmWarningLine size={14} aria-hidden />
        MOST CRITICAL ISSUE
      </span>
    );
  }
  return (
    <span className="font-mono mb-6 inline-flex items-center gap-2 rounded-full bg-v2-pass-bg px-[13px] py-[7px] text-[11.5px] tracking-[0.1em] text-v2-pass">
      <RiRocket2Line size={14} aria-hidden />
      BIGGEST OPPORTUNITY
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ReportHeroFinding({ checklist, copyVariants, viewportWidth }: Props) {
  const result = pickHeroFinding(checklist);
  if (!result) return null;

  const { finding, mode } = result;
  const isCritical = mode === "critical";
  const cardBorder = isCritical ? "border-v2-card-border" : "border-v2-opp-border";
  const bottomBg   = isCritical ? "border-v2-card-divider bg-v2-card-inner" : "border-v2-opp-divider bg-v2-opp-surface";

  // ── Viewport / performance finding ──────────────────────────────────────────
  if (isViewportOrPerformanceItem(finding) && viewportWidth != null) {
    const ratio = (viewportWidth / 375).toFixed(1);

    return (
      <section
        className={`overflow-hidden rounded-[16px] border bg-v2-card shadow-[0_1px_2px_rgba(27,26,23,0.03)] ${cardBorder}`}
      >
        <div className="px-6 pb-[30px] pt-[34px] md:px-9">
          {/* Single top badge — no severity chip below */}
          <HeroBadge isCritical={isCritical} />

          {/* Two columns: big ratio left, title + evidence right */}
          <div className="flex flex-wrap items-start gap-6 md:gap-9">
            <div className="shrink-0">
              <div className="text-[72px] font-semibold leading-[0.84] tracking-[-0.04em] text-v2-critical-text">
                {ratio}
                <span className="text-[34px] font-medium text-v2-stat-suffix">×</span>
              </div>
              <div className="font-mono mt-3 text-[11px] uppercase leading-[1.5] tracking-[0.03em] text-v2-ink-muted">
                wider than<br />mobile screen
              </div>
            </div>

            <div className="min-w-[240px] flex-1">
              <h2 className="mb-3 text-[22px] font-semibold leading-[1.2] tracking-[-0.02em] text-v2-ink md:text-[25px]">
                Viewport locked at {viewportWidth}px
              </h2>
              <p className="text-[15px] leading-[1.55] text-v2-ink-secondary">
                {finding.evidence || `${viewportWidth}px viewport detected, no mobile scaling`}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom: scale bar */}
        <div className={`border-t px-6 py-6 md:px-9 ${bottomBg}`}>
          <ViewportScale viewportWidth={viewportWidth} />
        </div>
      </section>
    );
  }

  // ── Standard finding layout ──────────────────────────────────────────────────
  const linkedCopy = copyVariants ? getLinkedCopy(finding, copyVariants) : null;

  const bottomSection = linkedCopy ? (
    <div className={`border-t px-6 py-6 md:px-9 ${bottomBg}`}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="relative rounded-[12px] border border-[#E8E5DB] bg-v2-card px-[22px] py-5">
          <span className="font-mono absolute right-3.5 top-3 rounded-full bg-v2-critical-bg px-[9px] py-1 text-[10.5px] font-semibold text-v2-critical">
            BEFORE
          </span>
          <p className="mt-7 text-[15px] leading-[1.4] text-[#9A9588]">{linkedCopy.before}</p>
        </div>
        <div className="relative rounded-[12px] border-[1.5px] border-[#A9D8BC] bg-v2-pass-surface px-[22px] py-5">
          <span className="font-mono absolute right-3.5 top-3 rounded-full bg-v2-pass-bg px-[9px] py-1 text-[10.5px] font-semibold text-v2-pass">
            AFTER
          </span>
          <p className="mt-7 text-[15px] font-semibold leading-[1.4] text-[#143322]">
            {linkedCopy.after}
          </p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <section
      className={`overflow-hidden rounded-[16px] border bg-v2-card shadow-[0_1px_2px_rgba(27,26,23,0.03)] ${cardBorder}`}
    >
      <div className="px-6 pb-[30px] pt-[34px] md:px-9">
        <HeroBadge isCritical={isCritical} />

        <div className="flex flex-wrap items-start gap-6 md:gap-10">
          <div className="shrink-0">
            {isCritical ? (
              <div className="inline-flex items-center gap-2 rounded-xl bg-v2-critical-bg px-4 py-3">
                <RiCloseCircleFill size={20} className="text-v2-critical-text" aria-hidden />
                <span className="font-mono text-[12px] font-semibold tracking-[0.06em] text-v2-critical">
                  {finding.status === "missing" ? "CRITICAL" : "HIGH"}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-xl bg-v2-pass-bg px-4 py-3">
                <RiCheckboxCircleFill size={20} className="text-v2-pass" aria-hidden />
                <span className="font-mono text-[12px] font-semibold tracking-[0.06em] text-v2-pass">
                  HIGH IMPACT
                </span>
              </div>
            )}
          </div>

          <div className="min-w-[260px] flex-1">
            <h2 className="mb-3.5 text-[22px] font-semibold leading-[1.2] tracking-[-0.02em] text-v2-ink md:text-[27px]">
              {finding.text}
            </h2>
            {finding.evidence && (
              <p className="text-[15px] leading-[1.55] text-v2-ink-secondary md:text-[16.5px]">
                {finding.evidence}
              </p>
            )}
          </div>
        </div>
      </div>

      {bottomSection}
    </section>
  );
}
