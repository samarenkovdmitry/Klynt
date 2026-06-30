"use client";

import {
  RiAlarmWarningLine,
  RiRocket2Line,
  RiArrowRightLine,
  RiBuildingLine,
  RiChatQuoteLine,
  RiStarLine,
  RiShieldCheckLine,
  RiCheckboxCircleFill,
  RiDoubleQuotesL,
  type RemixiconComponentType,
} from "@remixicon/react";
import type { ReactNode } from "react";
import type { ReportChecklistItem, ReportCopyVariants } from "@/lib/audit-report";
import type {
  HeroSlot,
  TrustCountSlot,
  CtaStatisticSlot,
  HeadlineTextualSlot,
  OpportunitySlot,
  ContrastNumericSlot,
} from "./ReportHero";

// ─── Types ────────────────────────────────────────────────────────────────────

type HeroMode = "critical" | "opportunity";

type Props = {
  checklist: ReportChecklistItem[];
  copyVariants?: ReportCopyVariants | null;
  viewportWidth?: number;
  heroSlot?: HeroSlot | null;
  domain?: string;
  sourceRow?: ReactNode;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Exported so ReportPageV2 can read the chosen id for deduplication in ReportPriorityQueue.
export function pickHeroFinding(
  checklist: ReportChecklistItem[]
): { finding: ReportChecklistItem; mode: HeroMode } | null {
  const issues = checklist.filter((i) => i.status !== "pass");
  if (issues.length === 0) return null;

  const critical = issues.find((i) => i.status === "missing");
  if (critical) return { finding: critical, mode: "critical" };

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

// ─── Shared primitives ────────────────────────────────────────────────────────

function CardShell({
  cardBorder,
  header,
  children,
}: {
  cardBorder: string;
  header?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={`overflow-hidden rounded-[16px] border bg-v2-card shadow-[0_1px_2px_rgba(27,26,23,0.03)] ${cardBorder}`}>
      {header && (
        <div className="border-b border-v2-card-divider px-6 py-3 md:px-8">
          {header}
        </div>
      )}
      {children}
    </section>
  );
}

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

function BottomStrip({
  label,
  bottomBg,
  children,
}: {
  label: string;
  bottomBg: string;
  children: ReactNode;
}) {
  return (
    <div className={`border-t px-6 py-[22px] md:px-8 ${bottomBg}`}>
      <span className="font-mono text-[11px] tracking-[0.06em] text-v2-ink-muted uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}

// ─── Viewport scale (inline) ──────────────────────────────────────────────────

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

      {/* Pill + vertical line above marker */}
      <div className="relative h-[36px]">
        <div
          className="absolute top-0 -translate-x-1/2"
          style={{ left: `${pCurrent}%` }}
        >
          <span className="font-mono inline-block whitespace-nowrap rounded-full border border-[#EF4444] px-[7px] py-[2px] text-[10px] font-semibold leading-[1.4] text-[#EF4444]">
            {viewportWidth}px
          </span>
        </div>
        <div
          className="absolute w-[1px] -translate-x-1/2 bg-[#EF4444]"
          style={{ left: `${pCurrent}%`, bottom: 0, height: "8px" }}
        />
      </div>

      {/* Track */}
      <div className="relative h-[7px] rounded-full bg-[rgba(0,0,0,0.06)]">
        <div
          className="absolute h-full bg-[#4CAF50]"
          style={{ left: `${greenLeft}%`, width: `${greenWidth}%`, borderRadius: "999px 0 0 999px" }}
        />
        {redWidth > 0 && (
          <div
            className="absolute h-full bg-[#EF4444]"
            style={{
              left: `calc(${pTablet}% + 2px)`,
              width: `calc(${redWidth}% - 2px)`,
              borderRadius: "0 999px 999px 0",
            }}
          />
        )}
        <div
          className="absolute top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#EF4444]"
          style={{ left: `${pCurrent}%` }}
        />
      </div>

      {/* Breakpoint labels */}
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

// ─── Format: trust_count ──────────────────────────────────────────────────────

const TRUST_ICONS: Record<string, RemixiconComponentType> = {
  "Customer logos": RiBuildingLine,
  Testimonials: RiChatQuoteLine,
  Ratings: RiStarLine,
  Guarantees: RiShieldCheckLine,
};

function TrustCountHero({
  slot, isCritical, bottomBg,
}: { slot: TrustCountSlot; isCritical: boolean; bottomBg: string }) {
  return (
    <>
      <div className="px-6 pb-7 pt-8 md:px-8">
        <HeroBadge isCritical={isCritical} />
        <div className="flex flex-wrap items-start gap-9">
          <div className="shrink-0">
            <div className="text-[74px] font-semibold leading-[0.84] tracking-[-0.04em] text-v2-critical-text">
              {slot.count}
            </div>
            <div className="font-mono mt-3 max-w-[150px] text-[11px] leading-[1.5] tracking-[0.03em] text-v2-ink-muted">
              {slot.label.toUpperCase()}
            </div>
          </div>
          <div className="min-w-[280px] flex-1">
            <h2 className="mb-3 text-[25px] font-semibold leading-[1.2] tracking-[-0.022em] text-v2-ink">
              {slot.title}
            </h2>
            <p className="text-[15.5px] leading-[1.55] text-v2-ink-secondary">{slot.description}</p>
          </div>
        </div>
      </div>
      <BottomStrip label="ABSENT — NONE DETECTED ABOVE THE FOLD" bottomBg={bottomBg}>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {slot.absent_items.map((item) => {
            const Icon = TRUST_ICONS[item] ?? RiShieldCheckLine;
            return (
              <div
                key={item}
                className="flex flex-col items-center gap-2.5 rounded-[12px] border-[1.5px] border-dashed border-v2-absent-border bg-v2-card px-3 py-[18px] text-center"
              >
                <Icon size={22} className="text-v2-absent" />
                <span className="text-[13px] font-semibold text-v2-ink-muted">{item}</span>
              </div>
            );
          })}
        </div>
      </BottomStrip>
    </>
  );
}

// ─── Format: cta_statistic ────────────────────────────────────────────────────

function CtaStatisticHero({
  slot, isCritical, bottomBg,
}: { slot: CtaStatisticSlot; isCritical: boolean; bottomBg: string }) {
  const match = slot.stat.match(/^([\d.]+)(.*)$/);
  const statBase = match?.[1] ?? slot.stat;
  const statSuffix = match?.[2] ?? "";

  return (
    <>
      <div className="px-6 pb-7 pt-8 md:px-8">
        <HeroBadge isCritical={isCritical} />
        <div className="flex flex-wrap items-start gap-9">
          <div className="shrink-0">
            <div className="text-[74px] font-semibold leading-[0.84] tracking-[-0.04em] text-v2-critical-text">
              {statBase}
              <span className="text-[38px] font-medium text-v2-stat-suffix">{statSuffix}</span>
            </div>
            <div className="font-mono mt-3 max-w-[160px] text-[11px] leading-[1.5] tracking-[0.03em] text-v2-ink-muted">
              {slot.stat_label.toUpperCase()}
              <br />({slot.stat_source.toUpperCase()})
            </div>
          </div>
          <div className="min-w-[280px] flex-1">
            <h2 className="mb-3 text-[25px] font-semibold leading-[1.2] tracking-[-0.022em] text-v2-ink">
              {slot.title}
            </h2>
            <p className="text-[15.5px] leading-[1.55] text-v2-ink-secondary">{slot.description}</p>
          </div>
        </div>
      </div>
      {slot.after_text && (
        <BottomStrip label="THE BUTTON, BEFORE & AFTER" bottomBg={bottomBg}>
          <div className="mt-3.5 grid grid-cols-[1fr_44px_1fr] items-center">
            <div className="flex flex-col items-center gap-3 rounded-[12px] border border-[#E8E5DB] bg-v2-card py-[22px]">
              <span className="font-mono text-[10.5px] font-semibold tracking-[0.06em] text-v2-ink-hairline">BEFORE</span>
              {slot.before_text ? (
                <span className="inline-flex rounded-[10px] bg-[#B6B1A4] px-[22px] py-[11px] text-[15px] font-semibold text-white">
                  {slot.before_text}
                </span>
              ) : (
                <span className="inline-flex rounded-[10px] border border-dashed border-[#C8C3B8] px-[22px] py-[11px] text-[13px] italic text-v2-ink-muted">
                  CTA not detected
                </span>
              )}
            </div>
            <div className="grid place-items-center">
              <RiArrowRightLine size={20} className="text-v2-arrow" />
            </div>
            <div className="flex flex-col items-center gap-3 rounded-[12px] border-[1.5px] border-[#A9D8BC] bg-v2-pass-surface py-[22px]">
              <span className="font-mono text-[10.5px] font-semibold tracking-[0.06em] text-v2-pass">AFTER</span>
              <span className="inline-flex rounded-[10px] bg-v2-pass px-[22px] py-[11px] text-[15px] font-semibold text-white">
                {slot.after_text}
              </span>
            </div>
          </div>
        </BottomStrip>
      )}
    </>
  );
}

// ─── Format: headline_textual ─────────────────────────────────────────────────

function HeadlineTextualHero({
  slot, isCritical,
}: { slot: HeadlineTextualSlot; isCritical: boolean }) {
  return (
    <>
      <div className="px-8 py-7">
        <HeroBadge isCritical={isCritical} />
        <div className="flex flex-wrap items-start gap-5">
          <RiDoubleQuotesL size={52} className="shrink-0" style={{ color: "#F4A7A7", lineHeight: 0.8 }} />
          <div className="min-w-[280px] flex-1">
            <h2 className="mb-3 text-[25px] font-semibold leading-[1.2] tracking-[-0.022em] text-v2-ink">
              {slot.issue_title}
            </h2>
            <p className="text-[15px] leading-[1.6] text-[#6B7280]">
              {slot.quote && (
                <><b className="font-semibold text-[#374151]">&ldquo;{slot.quote}&rdquo;</b>{" "}</>
              )}
              {slot.explanation}
            </p>
          </div>
        </div>
      </div>
      {slot.after_text && (
        <div className="border-t border-v2-card-divider bg-[#F7F6F3] px-6 py-5">
          <span className="font-mono mb-3 block text-[11px] tracking-[0.08em] text-[#9CA3AF]">
            {slot.section_label}
          </span>
          <div className="grid grid-cols-1 items-stretch sm:grid-cols-[1fr_36px_1fr]">
            <div className="rounded-lg border border-[rgba(0,0,0,0.06)] bg-[#F5F3EF] px-5 py-[18px]">
              <p className="font-mono mb-2 text-[10.5px] font-semibold tracking-[0.06em] text-[#9CA3AF]">BEFORE</p>
              <p className="text-[17px] font-semibold leading-[1.3] text-[#9CA3AF]">{slot.before_text}</p>
            </div>
            <div className="flex items-center justify-center">
              <span className="hidden text-[18px] text-[#9CA3AF] sm:inline">→</span>
              <span className="py-2 text-[18px] text-[#9CA3AF] sm:hidden">↓</span>
            </div>
            <div className="rounded-lg border-[1.5px] border-[#86EFAC] bg-[#F0FAF4] px-5 py-[18px]">
              <p className="font-mono mb-2 text-[10.5px] font-semibold tracking-[0.06em] text-[#166534]">AFTER</p>
              <p className="text-[17px] font-bold leading-[1.3] text-[#14532D]">{slot.after_text}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Format: opportunity ──────────────────────────────────────────────────────

function OpportunityHero({
  slot, isCritical, bottomBg,
}: { slot: OpportunitySlot; isCritical: boolean; bottomBg: string }) {
  return (
    <>
      <div className="px-6 pb-7 pt-8 md:px-8">
        <HeroBadge isCritical={isCritical} />
        <div className="flex flex-wrap items-start gap-9">
          <div className="shrink-0">
            <div className="text-[74px] font-semibold leading-[0.84] tracking-[-0.04em] text-v2-opp-score">
              {slot.score.toFixed(1)}
              <span className="text-[34px] font-medium text-v2-opp-suffix">/10</span>
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold tracking-[0.01em] text-v2-pass">
              <RiCheckboxCircleFill size={14} />
              {slot.score_label}
            </div>
          </div>
          <div className="min-w-[280px] flex-1">
            <h2 className="mb-3 text-[25px] font-semibold leading-[1.2] tracking-[-0.022em] text-v2-ink">
              {slot.title}
            </h2>
            <p className="text-[15.5px] leading-[1.55] text-v2-ink-secondary">{slot.description}</p>
          </div>
        </div>
      </div>
      <BottomStrip label={slot.section_label} bottomBg={bottomBg}>
        <div className="mt-3.5 grid grid-cols-1 items-stretch sm:grid-cols-[1fr_44px_1fr]">
          <div className="rounded-t-[12px] border border-[#E8E5DB] bg-v2-card px-[18px] py-4 sm:rounded-l-[12px] sm:rounded-tr-none">
            <p className="font-mono mb-2 text-[10.5px] font-semibold tracking-[0.06em] text-v2-ink-hairline">BEFORE</p>
            <p className="text-[14px] leading-[1.45] text-v2-before-text">{slot.before_text}</p>
          </div>
          <div className="flex items-center justify-center py-2 sm:py-0">
            <RiArrowRightLine size={20} className="rotate-90 text-[#B6D8C3] sm:rotate-0" />
          </div>
          <div className="rounded-b-[12px] border-[1.5px] border-[#A9D8BC] bg-v2-pass-surface px-[18px] py-4 sm:rounded-r-[12px] sm:rounded-bl-none">
            <p className="font-mono mb-2 text-[10.5px] font-semibold tracking-[0.06em] text-v2-pass">AFTER</p>
            <p className="text-[14px] leading-[1.45] text-[#2C4536]">{slot.after_text}</p>
          </div>
        </div>
      </BottomStrip>
    </>
  );
}

// ─── Format: contrast_numeric ─────────────────────────────────────────────────

function ContrastNumericHero({
  slot, isCritical, bottomBg, domain,
}: { slot: ContrastNumericSlot; isCritical: boolean; bottomBg: string; domain?: string }) {
  const [ratioBase, ratioSuffix] = slot.ratio.includes(":")
    ? [slot.ratio.split(":")[0], `:${slot.ratio.split(":")[1]}`]
    : [slot.ratio, ""];

  return (
    <>
      <div className="px-6 pb-7 pt-8 md:px-8">
        <HeroBadge isCritical={isCritical} />
        <div className="flex flex-wrap items-start gap-9">
          <div className="shrink-0">
            <div className="text-[74px] font-semibold leading-[0.84] tracking-[-0.04em] text-v2-critical-text">
              {ratioBase}
              <span className="text-[36px] font-medium text-v2-stat-suffix">{ratioSuffix}</span>
            </div>
            <div className="mt-3 text-[13px] font-semibold tracking-[0.01em] text-v2-critical">
              Fails WCAG AA · needs 4.5:1
            </div>
          </div>
          <div className="min-w-[280px] flex-1">
            <h2 className="mb-3 text-[25px] font-semibold leading-[1.2] tracking-[-0.022em] text-v2-ink">
              {slot.title}
            </h2>
            <p className="text-[15.5px] leading-[1.55] text-v2-ink-secondary">{slot.description}</p>
          </div>
        </div>
      </div>
      <BottomStrip
        label={domain ? `AS IT RENDERS ON ${domain.toUpperCase()}` : "AS IT RENDERS"}
        bottomBg={bottomBg}
      >
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div
            className="relative rounded-[12px] border border-[#E8E5DB] px-5 py-[18px]"
            style={{ background: slot.side_by_side.bg_before || "#ffffff" }}
          >
            <span className="font-mono absolute right-3.5 top-3 rounded-full bg-v2-critical-bg px-[9px] py-1 text-[10.5px] font-semibold text-v2-critical">
              {slot.ratio}
            </span>
            <p className="pt-6 text-[14.5px] leading-[1.5]" style={{ color: slot.side_by_side.color_before }}>
              {slot.side_by_side.text}
            </p>
          </div>
          <div className="relative rounded-[12px] border-[1.5px] border-[#A9D8BC] bg-v2-pass-surface px-5 py-[18px]">
            <span className="font-mono absolute right-3.5 top-3 rounded-full bg-v2-pass-bg px-[9px] py-1 text-[10.5px] font-semibold text-v2-pass">
              {slot.after_label}
            </span>
            <p className="pt-6 text-[14.5px] leading-[1.5]" style={{ color: slot.side_by_side.color_after }}>
              {slot.side_by_side.text}
            </p>
          </div>
        </div>
      </BottomStrip>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ReportHeroFinding({ checklist, copyVariants, viewportWidth, heroSlot, domain, sourceRow }: Props) {
  const result = pickHeroFinding(checklist);
  if (!result) return null;

  const { finding, mode } = result;
  const isCritical = mode === "critical";
  const cardBorder = isCritical ? "border-v2-card-border" : "border-v2-opp-border";
  const bottomBg   = isCritical ? "border-v2-card-divider bg-v2-card-inner" : "border-v2-opp-divider bg-v2-opp-surface";
  const header = sourceRow ?? undefined;

  // ── Viewport / performance finding ──────────────────────────────────────────
  if (isViewportOrPerformanceItem(finding) && viewportWidth != null) {
    const ratio = (viewportWidth / 375).toFixed(1);
    return (
      <CardShell cardBorder={cardBorder} header={header}>
        <div className="px-6 pb-[30px] pt-[34px] md:px-9">
          <HeroBadge isCritical={isCritical} />
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
                Viewport locks out your mobile majority
              </h2>
              <p className="text-[15px] leading-[1.55] text-v2-ink-secondary">
                Every smartphone visitor sees a desktop-scaled page — pinch-zoom required, scroll broken, CTAs cut off. One meta tag fix stops this immediately.
              </p>
            </div>
          </div>
        </div>
        <div className={`border-t px-6 py-6 md:px-9 ${bottomBg}`}>
          <ViewportScale viewportWidth={viewportWidth} />
        </div>
      </CardShell>
    );
  }

  // ── Hero-slot formats ────────────────────────────────────────────────────────
  if (heroSlot) {
    // Stored hero_slot may have after_text = topIssue.fix (a generic instruction).
    // Override with the real copy variant when available; empty string hides the section.
    let resolvedSlot = heroSlot;
    if (heroSlot.type === "headline_textual") {
      resolvedSlot = {
        ...heroSlot,
        after_text: copyVariants?.headline?.variants?.[0]?.text ?? "",
      };
    } else if (heroSlot.type === "cta_statistic") {
      resolvedSlot = {
        ...heroSlot,
        before_text: copyVariants?.cta?.current ?? heroSlot.before_text,
        after_text: copyVariants?.cta?.variants?.[0]?.text ?? "",
      };
    }

    switch (resolvedSlot.type) {
      case "trust_count":
        return (
          <CardShell cardBorder={cardBorder} header={header}>
            <TrustCountHero slot={resolvedSlot} isCritical={isCritical} bottomBg={bottomBg} />
          </CardShell>
        );
      case "cta_statistic":
        return (
          <CardShell cardBorder={cardBorder} header={header}>
            <CtaStatisticHero slot={resolvedSlot} isCritical={isCritical} bottomBg={bottomBg} />
          </CardShell>
        );
      case "headline_textual":
        return (
          <CardShell cardBorder={cardBorder} header={header}>
            <HeadlineTextualHero slot={resolvedSlot} isCritical={isCritical} />
          </CardShell>
        );
      case "opportunity":
        return (
          <CardShell cardBorder={cardBorder} header={header}>
            <OpportunityHero slot={resolvedSlot} isCritical={isCritical} bottomBg={bottomBg} />
          </CardShell>
        );
      case "contrast_numeric":
        return (
          <CardShell cardBorder={cardBorder} header={header}>
            <ContrastNumericHero slot={resolvedSlot} isCritical={isCritical} bottomBg={bottomBg} domain={domain} />
          </CardShell>
        );
    }
  }

  // ── Fallback: simple layout ──────────────────────────────────────────────────
  // Used when hero_slot is not available (old reports without narrative).
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
    <CardShell cardBorder={cardBorder} header={header}>
      <div className="px-6 pb-[30px] pt-[34px] md:px-9">
        <HeroBadge isCritical={isCritical} />
        <h2 className="mb-3.5 text-[22px] font-semibold leading-[1.2] tracking-[-0.02em] text-v2-ink md:text-[27px]">
          {finding.text}
        </h2>
        {finding.evidence && (
          <p className="text-[15px] leading-[1.55] text-v2-ink-secondary md:text-[16.5px]">
            {finding.evidence}
          </p>
        )}
      </div>
      {bottomSection}
    </CardShell>
  );
}
