import type { AuditReport, ReportChecklistItem } from "@/lib/audit-report";
import type { HeroSlot } from "@/components/report-v2/ReportHero";

// ─── CTA stats pool ───────────────────────────────────────────────────────────

const CTA_STATS = {
  stat: "47%",
  stat_label: "higher CTR with specific, outcome-focused CTA copy",
  stat_source: "CXL Institute",
};

// ─── Trust signal keyword → display label ────────────────────────────────────

const TRUST_KEYWORD_MAP: Array<[string, string]> = [
  ["logo", "Customer logos"],
  ["customer", "Customer logos"],
  ["testimonial", "Testimonials"],
  ["quote", "Testimonials"],
  ["review", "Ratings"],
  ["rating", "Ratings"],
  ["star", "Ratings"],
  ["guarantee", "Guarantees"],
  ["money back", "Guarantees"],
  ["refund", "Guarantees"],
];

const DEFAULT_ABSENT_ITEMS = ["Customer logos", "Testimonials", "Ratings", "Guarantees"];

function deriveTrustAbsentItems(evidence?: string): string[] {
  if (!evidence) return DEFAULT_ABSENT_ITEMS;
  const lower = evidence.toLowerCase();
  const found = new Set<string>();
  for (const [keyword, label] of TRUST_KEYWORD_MAP) {
    if (lower.includes(keyword)) found.add(label);
  }
  // Need at least 2 items to be useful for the count display
  return found.size >= 2 ? Array.from(found) : DEFAULT_ABSENT_ITEMS;
}

// ─── Slot builders ────────────────────────────────────────────────────────────

function buildOpportunitySlot(report: AuditReport): HeroSlot {
  const headline = report.copy_variants?.headline;
  return {
    type: "opportunity",
    score: report.score,
    score_label: "No critical blockers found",
    title: "Solid UX foundation — your biggest gain is fine-tuning",
    description:
      report.summary ??
      "Visitors can navigate and understand the offer. The remaining opportunities are incremental improvements to copy and trust signals.",
    before_text:
      headline?.current ?? "Current copy and structure is functional but could be more specific",
    after_text:
      headline?.variants?.[0]?.text ??
      "Sharper headline with audience signal and clear outcome",
    section_label: "HEADLINE OPPORTUNITY",
  };
}

function buildTrustCountSlot(item: ReportChecklistItem): HeroSlot {
  return {
    type: "trust_count",
    title: item.text,
    description:
      item.evidence ??
      "Trust signals help visitors decide to stay and convert. Their absence increases bounce rate.",
    count: 0,
    label: "TRUST SIGNALS ABOVE THE FOLD",
    absent_items: deriveTrustAbsentItems(item.evidence),
  };
}

function buildCtaStatisticSlot(item: ReportChecklistItem, report: AuditReport): HeroSlot {
  const cta = report.copy_variants?.cta;
  return {
    type: "cta_statistic",
    ...CTA_STATS,
    title: item.text,
    description:
      item.evidence ?? "A vague CTA forces visitors to guess what happens next — most don't.",
    before_text: cta?.current || "Start for free",
    after_text: cta?.variants?.[0]?.text || "Start your 14-day free trial",
  };
}

function buildHeadlineTextualSlot(
  item: ReportChecklistItem | undefined,
  report: AuditReport
): HeroSlot {
  const headline = report.copy_variants?.headline;
  return {
    type: "headline_textual",
    issue_title: item?.text ?? "Your headline could be more specific",
    quote: headline?.current ?? "",
    explanation:
      item?.evidence ??
      "A headline that names its audience converts the visitors who self-identify.",
    before_text: headline?.current ?? "",
    after_text: headline?.variants?.[0]?.text ?? "",
    section_label: "HEADLINE, BEFORE & AFTER",
  };
}

// ─── Main selector ────────────────────────────────────────────────────────────

/**
 * Derives the correct hero slot from report data.
 *
 * Priority order:
 *  E — opportunity   : score >= 7.5 AND no "missing" checklist items
 *  C — trust_count   : top issue is category "trust" / link_to "trust"
 *  B — cta_statistic : top issue is link_to "copy-cta" and status "missing"
 *  D — headline_textual : all other copy/structural issues (default)
 *
 * Format A (contrast_numeric) is only used when hero_slot is explicitly set
 * server-side with measured ratio/hex data; it cannot be reliably derived
 * from the text-only visual_fixes observations.
 */
export function deriveHeroSlot(report: AuditReport): HeroSlot {
  const checklist = report.checklist ?? [];
  const nonPassItems = checklist.filter((i) => i.status !== "pass");
  const missingItems = nonPassItems.filter((i) => i.status === "missing");

  // E — no critical blockers
  if (missingItems.length === 0 && report.score >= 7.5) {
    return buildOpportunitySlot(report);
  }

  // Top issue = first "missing", falling back to first "weak"
  const topItem = missingItems[0] ?? nonPassItems[0];

  if (!topItem) {
    return buildHeadlineTextualSlot(undefined, report);
  }

  // C — trust
  if (topItem.category === "trust" || topItem.link_to === "trust") {
    return buildTrustCountSlot(topItem);
  }

  // B — CTA (only when "missing"; "weak" CTA falls through to D for headline framing)
  if (topItem.link_to === "copy-cta" && topItem.status === "missing") {
    return buildCtaStatisticSlot(topItem, report);
  }

  // D — headline/copy/structural (default)
  if (
    topItem.link_to !== "copy-headline" &&
    topItem.link_to !== "copy-cta" &&
    topItem.link_to !== "copy-subheadline" &&
    topItem.category !== "copy"
  ) {
    console.warn(
      `[ReportHero] Unmatched top issue — falling back to headline_textual. category="${topItem.category}" link_to="${topItem.link_to}" status="${topItem.status}"`
    );
  }

  return buildHeadlineTextualSlot(topItem, report);
}
