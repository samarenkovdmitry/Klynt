"use client";

import {
  RiAlarmWarningLine,
  RiRocket2Line,
  RiCloseCircleFill,
  RiCheckboxCircleFill,
  RiArrowRightLine,
  RiBuildingLine,
  RiChatQuoteLine,
  RiStarLine,
  RiShieldCheckLine,
  RiDoubleQuotesL,
  type RemixiconComponentType,
} from "@remixicon/react";
import type { AuditReport } from "@/lib/audit-report";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContrastNumericSlot = {
  type: "contrast_numeric";
  title: string;
  description: string;
  ratio: string;
  label: string;
  before_hex: string;
  after_hex: string;
  after_label: string;
  before_context: string;
  side_by_side: {
    text: string;
    bg_before: string;
    color_before: string;
    color_after: string;
  };
};

export type CtaStatisticSlot = {
  type: "cta_statistic";
  title: string;
  stat: string;
  stat_label: string;
  stat_source: string;
  description: string;
  before_text: string;
  after_text: string;
};

export type TrustCountSlot = {
  type: "trust_count";
  title: string;
  description: string;
  count: number;
  label: string;
  absent_items: string[];
};

export type HeadlineTextualSlot = {
  type: "headline_textual";
  issue_title: string;
  quote: string;
  explanation: string;
  before_text: string;
  after_text: string;
  section_label: string;
};

export type OpportunitySlot = {
  type: "opportunity";
  score: number;
  score_label: string;
  title: string;
  description: string;
  before_text: string;
  after_text: string;
  section_label: string;
};

export type HeroSlot =
  | ContrastNumericSlot
  | CtaStatisticSlot
  | TrustCountSlot
  | HeadlineTextualSlot
  | OpportunitySlot;

type Props = {
  slot?: HeroSlot | null;
  report: AuditReport;
  domain?: string;
};

// ─── Shared pieces ────────────────────────────────────────────────────────────

function Badge({ isOpportunity }: { isOpportunity?: boolean }) {
  if (isOpportunity) {
    return (
      <span className="font-mono mb-[22px] inline-flex items-center gap-2 rounded-full bg-v2-pass-bg px-[13px] py-[7px] text-[11px] tracking-[0.1em] text-v2-pass">
        <RiRocket2Line size={13} />
        BIGGEST OPPORTUNITY
      </span>
    );
  }
  return (
    <span className="font-mono mb-[22px] inline-flex items-center gap-2 rounded-full bg-v2-critical-bg px-[13px] py-[7px] text-[11px] tracking-[0.1em] text-v2-critical">
      <RiAlarmWarningLine size={13} />
      MOST CRITICAL ISSUE
    </span>
  );
}

function BottomStrip({
  label,
  isOpportunity,
  children,
}: {
  label: string;
  isOpportunity?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`border-t px-6 py-[22px] md:px-8 ${
        isOpportunity
          ? "border-v2-opp-divider bg-v2-opp-surface"
          : "border-v2-card-divider bg-v2-card-inner"
      }`}
    >
      <span className="font-mono text-[11px] tracking-[0.06em] text-v2-ink-muted uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}

// ─── Format A — contrast_numeric ─────────────────────────────────────────────

function FormatA({ slot, domain }: { slot: ContrastNumericSlot; domain?: string }) {
  const [ratioBase, ratioSuffix] = slot.ratio.includes(":")
    ? [slot.ratio.split(":")[0], `:${slot.ratio.split(":")[1]}`]
    : [slot.ratio, ""];

  return (
    <div className="overflow-hidden rounded-[16px] border border-v2-card-border bg-v2-card shadow-[0_1px_3px_rgba(27,26,23,0.05)]">
      <div className="px-6 pb-7 pt-8 md:px-8">
        <Badge />
        <div className="flex flex-wrap items-start gap-9">
          <div className="shrink-0">
            <div className="text-[74px] font-semibold leading-[0.84] tracking-[-0.04em] text-v2-critical-text">
              {ratioBase}
              <span className="text-[36px] font-medium text-v2-stat-suffix">{ratioSuffix}</span>
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold tracking-[0.01em] text-v2-critical">
              <RiCloseCircleFill size={14} />
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
      >
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div
            className="relative rounded-[12px] border border-[#E8E5DB] px-5 py-[18px]"
            style={{ background: slot.side_by_side.bg_before || "#ffffff" }}
          >
            <span className="font-mono absolute right-3.5 top-3 rounded-full bg-v2-critical-bg px-[9px] py-1 text-[10.5px] font-semibold text-v2-critical">
              {slot.ratio}
            </span>
            <p
              className="pt-6 text-[14.5px] leading-[1.5]"
              style={{ color: slot.side_by_side.color_before }}
            >
              {slot.side_by_side.text}
            </p>
          </div>
          <div className="relative rounded-[12px] border-[1.5px] border-[#A9D8BC] bg-v2-pass-surface px-5 py-[18px]">
            <span className="font-mono absolute right-3.5 top-3 rounded-full bg-v2-pass-bg px-[9px] py-1 text-[10.5px] font-semibold text-v2-pass">
              {slot.after_label}
            </span>
            <p
              className="pt-6 text-[14.5px] leading-[1.5]"
              style={{ color: slot.side_by_side.color_after }}
            >
              {slot.side_by_side.text}
            </p>
          </div>
        </div>
      </BottomStrip>
    </div>
  );
}

// ─── Format B — cta_statistic ─────────────────────────────────────────────────

function FormatB({ slot }: { slot: CtaStatisticSlot }) {
  const match = slot.stat.match(/^([\d.]+)(.*)$/);
  const statBase = match?.[1] ?? slot.stat;
  const statSuffix = match?.[2] ?? "";

  return (
    <div className="overflow-hidden rounded-[16px] border border-v2-card-border bg-v2-card shadow-[0_1px_3px_rgba(27,26,23,0.05)]">
      <div className="px-6 pb-7 pt-8 md:px-8">
        <Badge />
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

      <BottomStrip label="THE BUTTON, BEFORE & AFTER">
        <div className="mt-3.5 grid grid-cols-[1fr_44px_1fr] items-center">
          <div className="flex flex-col items-center gap-3 rounded-[12px] border border-[#E8E5DB] bg-v2-card py-[22px]">
            <span className="font-mono text-[10.5px] font-semibold tracking-[0.06em] text-v2-ink-hairline">
              BEFORE
            </span>
            <span className="inline-flex rounded-[10px] bg-[#B6B1A4] px-[22px] py-[11px] text-[15px] font-semibold text-white">
              {slot.before_text}
            </span>
          </div>
          <div className="grid place-items-center">
            <RiArrowRightLine size={20} className="text-v2-arrow" />
          </div>
          <div className="flex flex-col items-center gap-3 rounded-[12px] border-[1.5px] border-[#A9D8BC] bg-v2-pass-surface py-[22px]">
            <span className="font-mono text-[10.5px] font-semibold tracking-[0.06em] text-v2-pass">
              AFTER
            </span>
            <span className="inline-flex rounded-[10px] bg-v2-pass px-[22px] py-[11px] text-[15px] font-semibold text-white">
              {slot.after_text}
            </span>
          </div>
        </div>
      </BottomStrip>
    </div>
  );
}

// ─── Format C — trust_count ───────────────────────────────────────────────────

const TRUST_ICONS: Record<string, RemixiconComponentType> = {
  "Customer logos": RiBuildingLine,
  Testimonials: RiChatQuoteLine,
  Ratings: RiStarLine,
  Guarantees: RiShieldCheckLine,
};

function FormatC({ slot }: { slot: TrustCountSlot }) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-v2-card-border bg-v2-card shadow-[0_1px_3px_rgba(27,26,23,0.05)]">
      <div className="px-6 pb-7 pt-8 md:px-8">
        <Badge />
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

      <BottomStrip label="ABSENT — NONE DETECTED ABOVE THE FOLD">
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
    </div>
  );
}

// ─── Format D — headline_textual ─────────────────────────────────────────────

function FormatD({ slot }: { slot: HeadlineTextualSlot }) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-v2-card-border bg-v2-card shadow-[0_1px_3px_rgba(27,26,23,0.05)]">
      <div className="px-6 pb-7 pt-8 md:px-8">
        <Badge />
        <div className="flex flex-wrap items-start gap-6">
          <RiDoubleQuotesL
            size={62}
            className="shrink-0 text-v2-quote-icon"
            style={{ lineHeight: 0.8 }}
          />
          <div className="min-w-[280px] flex-1">
            <h2 className="mb-3 text-[25px] font-semibold leading-[1.2] tracking-[-0.022em] text-v2-ink">
              {slot.issue_title}
            </h2>
            <p className="text-[15.5px] leading-[1.55] text-v2-ink-secondary">
              {slot.quote && (
                <>
                  <b className="font-semibold text-v2-ink">&ldquo;{slot.quote}&rdquo;</b>{" "}
                </>
              )}
              {slot.explanation}
            </p>
          </div>
        </div>
      </div>

      <BottomStrip label={slot.section_label}>
        <div className="mt-3.5 grid grid-cols-1 items-stretch sm:grid-cols-[1fr_44px_1fr]">
          <div className="rounded-t-[12px] border border-[#E8E5DB] bg-v2-card px-5 py-[18px] sm:rounded-l-[12px] sm:rounded-tr-none">
            <p className="font-mono mb-2 text-[10.5px] font-semibold tracking-[0.06em] text-v2-ink-hairline">
              BEFORE
            </p>
            <p className="text-[18px] font-semibold leading-[1.3] text-v2-before-text">
              {slot.before_text}
            </p>
          </div>
          <div className="flex items-center justify-center border-x-0 border-y border-[#E8E5DB] bg-v2-card-inner py-2 sm:border-x sm:border-y-0 sm:bg-transparent sm:py-0">
            <RiArrowRightLine size={20} className="rotate-90 text-v2-arrow sm:rotate-0" />
          </div>
          <div className="rounded-b-[12px] border-[1.5px] border-[#A9D8BC] bg-v2-pass-surface px-5 py-[18px] sm:rounded-r-[12px] sm:rounded-bl-none">
            <p className="font-mono mb-2 text-[10.5px] font-semibold tracking-[0.06em] text-v2-pass">
              AFTER
            </p>
            <p className="text-[18px] font-bold leading-[1.3] text-v2-after-text">
              {slot.after_text}
            </p>
          </div>
        </div>
      </BottomStrip>
    </div>
  );
}

// ─── Format E — opportunity ───────────────────────────────────────────────────

function FormatE({ slot }: { slot: OpportunitySlot }) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-v2-opp-border bg-v2-card shadow-[0_1px_3px_rgba(20,60,40,0.06)]">
      <div className="px-6 pb-7 pt-8 md:px-8">
        <Badge isOpportunity />
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

      <BottomStrip label={slot.section_label} isOpportunity>
        <div className="mt-3.5 grid grid-cols-1 items-stretch sm:grid-cols-[1fr_44px_1fr]">
          <div className="rounded-t-[12px] border border-[#E8E5DB] bg-v2-card px-[18px] py-4 sm:rounded-l-[12px] sm:rounded-tr-none">
            <p className="font-mono mb-2 text-[10.5px] font-semibold tracking-[0.06em] text-v2-ink-hairline">
              BEFORE
            </p>
            <p className="text-[14px] leading-[1.45] text-v2-before-text">{slot.before_text}</p>
          </div>
          <div className="flex items-center justify-center py-2 sm:py-0">
            <RiArrowRightLine size={20} className="rotate-90 text-[#B6D8C3] sm:rotate-0" />
          </div>
          <div className="rounded-b-[12px] border-[1.5px] border-[#A9D8BC] bg-v2-pass-surface px-[18px] py-4 sm:rounded-r-[12px] sm:rounded-bl-none">
            <p className="font-mono mb-2 text-[10.5px] font-semibold tracking-[0.06em] text-v2-pass">
              AFTER
            </p>
            <p className="text-[14px] leading-[1.45] text-[#2C4536]">{slot.after_text}</p>
          </div>
        </div>
      </BottomStrip>
    </div>
  );
}

// ─── Fallback builder ─────────────────────────────────────────────────────────

function buildFallback(report: AuditReport): HeadlineTextualSlot {
  const headlineItem =
    report.checklist?.find((i) => i.link_to === "copy-headline" && i.status !== "pass") ??
    report.checklist?.find((i) => i.status !== "pass");

  const headline = report.copy_variants?.headline;

  return {
    type: "headline_textual",
    issue_title: headlineItem?.text ?? "Your headline could be more specific",
    quote: headline?.current ?? "",
    explanation:
      headlineItem?.evidence ??
      "A headline that names its audience converts the visitors who self-identify.",
    before_text: headline?.current ?? "",
    after_text: headline?.variants?.[0]?.text ?? "",
    section_label: "HEADLINE, BEFORE & AFTER",
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ReportHero({ slot, report, domain }: Props) {
  const resolved = slot ?? buildFallback(report);

  switch (resolved.type) {
    case "contrast_numeric":
      return <FormatA slot={resolved} domain={domain} />;
    case "cta_statistic":
      return <FormatB slot={resolved} />;
    case "trust_count":
      return <FormatC slot={resolved} />;
    case "headline_textual":
      return <FormatD slot={resolved} />;
    case "opportunity":
      return <FormatE slot={resolved} />;
  }
}
