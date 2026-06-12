import type {
  ChecklistCategory,
  ChecklistItemStatus,
  ChecklistLinkTarget,
  ReportChecklistItem,
} from "@/lib/audit-report";
import { isLlmPlaceholderText } from "@/lib/llm-placeholder-text";

const GAP_LABEL_DEFAULTS: Record<string, string> = {
  "copy-headline:missing": "Category missing",
  "copy-cta:missing": "Trial unclear",
  "copy-subheadline:missing": "Content weak",
  "copy-subheadline:weak": "Content weak",
  "trust:missing": "Trust missing above fold",
  "visual-fixes:weak": "Weak typography",
};

const GAP_TEXT_FALLBACKS: Record<string, string> = {
  "copy-headline:missing": "Headline does not state product category",
  "copy-headline:weak": "Headline positioning is weak for cold traffic",
  "copy-cta:missing": "CTA does not clarify trial or next step",
  "copy-cta:weak": "CTA copy does not reduce signup friction",
  "copy-subheadline:missing": "Subheadline missing or too vague",
  "copy-subheadline:weak": "Subheadline reads as caption, not value prop",
  "trust:missing": "Trust proof missing above the fold",
  "trust:weak": "Trust proof above the fold is weak",
  "visual-fixes:weak": "Subheadline typography too light to scan quickly",
};

const CHIP_GAP_LABEL_ALIASES: Record<string, string> = {
  "Trust missing": "Trust missing above fold",
  "Trust signals missing": "Trust missing above fold",
};

const VALID_LINK_TARGETS = new Set<ChecklistLinkTarget>([
  "copy-headline",
  "copy-cta",
  "copy-subheadline",
  "trust",
  "visual-fixes",
]);

const VALID_CATEGORIES = new Set<ChecklistCategory>([
  "copy",
  "trust",
  "visual",
  "structure",
]);

function isGarbledChecklistText(text: string): boolean {
  const trimmed = text.trim();

  if (trimmed.length < 10) {
    return true;
  }

  const words = trimmed.split(/\s+/);

  if (words.length < 3) {
    return true;
  }

  if (/^[A-Z0-9\s—\-.,!?'"]+$/.test(trimmed) && trimmed.length > 20) {
    return true;
  }

  if (/unreachable or target/i.test(trimmed)) {
    return true;
  }

  if (isLlmPlaceholderText(trimmed)) {
    return true;
  }

  if (/gutter of product/i.test(trimmed)) {
    return true;
  }

  if ((trimmed.match(/target audience/gi) || []).length > 1) {
    return true;
  }

  return false;
}

function headlineOverlap(a: string, b: string): boolean {
  const la = a.toLowerCase();
  const lb = b.toLowerCase();
  const signals = ["headline", "hero title", "product category", "category", "tool does"];

  const aHits = signals.filter((s) => la.includes(s)).length;
  const bHits = signals.filter((s) => lb.includes(s)).length;

  return aHits > 0 && bHits > 0;
}

export function deriveChecklistGapLabel(item: ReportChecklistItem): string | undefined {
  if (item.status === "pass" || !item.link_to) {
    return undefined;
  }

  if (typeof item.gap_label === "string" && item.gap_label.trim()) {
    return item.gap_label.trim();
  }

  const key = `${item.link_to}:${item.status}`;
  return GAP_LABEL_DEFAULTS[key];
}

export function getChecklistBadgeLabel(item: ReportChecklistItem): string {
  if (item.status === "pass") {
    return "Pass";
  }

  if (item.status === "missing") {
    return "Missing";
  }

  if (item.link_to === "visual-fixes" || item.category === "visual") {
    return "Weak typography";
  }

  if (item.link_to === "copy-subheadline") {
    return "Content weak";
  }

  return "Weak";
}

function parseChecklistItem(raw: unknown): ReportChecklistItem | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const item = raw as Record<string, unknown>;
  const text = typeof item.text === "string" ? item.text.trim() : "";

  if (!text) {
    return null;
  }

  const status: ChecklistItemStatus =
    item.status === "missing" || item.status === "weak" || item.status === "pass"
      ? item.status
      : "pass";

  const linkRaw = item.link_to;
  const link_to =
    typeof linkRaw === "string" && VALID_LINK_TARGETS.has(linkRaw as ChecklistLinkTarget)
      ? (linkRaw as ChecklistLinkTarget)
      : status === "pass"
        ? null
        : null;

  const categoryRaw = item.category;
  const category: ChecklistCategory = VALID_CATEGORIES.has(categoryRaw as ChecklistCategory)
    ? (categoryRaw as ChecklistCategory)
    : link_to === "trust"
      ? "trust"
      : link_to === "visual-fixes"
        ? "visual"
        : link_to?.startsWith("copy-")
          ? "copy"
          : "structure";

  const id =
    typeof item.id === "string" && item.id.trim()
      ? item.id.trim()
      : link_to ?? `check-${text.slice(0, 24).toLowerCase().replace(/\s+/g, "-")}`;

  const gap_label =
    typeof item.gap_label === "string" && item.gap_label.trim()
      ? item.gap_label.trim().slice(0, 40)
      : undefined;

  const parsed: ReportChecklistItem = {
    id,
    text,
    status,
    link_to: status === "pass" ? null : link_to,
    category,
    ...(gap_label ? { gap_label } : {}),
  };

  if (isLlmPlaceholderText(parsed.text)) {
    if (parsed.status === "pass") {
      return null;
    }

    const fallbackKey = parsed.link_to ? `${parsed.link_to}:${parsed.status}` : null;
    parsed.text =
      (fallbackKey ? GAP_TEXT_FALLBACKS[fallbackKey] : undefined) ??
      deriveChecklistGapLabel(parsed) ??
      "Needs improvement";
  }

  if (parsed.gap_label && isLlmPlaceholderText(parsed.gap_label)) {
    delete (parsed as { gap_label?: string }).gap_label;
  }

  if (status !== "pass" && isGarbledChecklistText(parsed.text)) {
    return null;
  }

  return parsed;
}

function dedupeGaps(items: ReportChecklistItem[]): ReportChecklistItem[] {
  const passes = items.filter((item) => item.status === "pass");
  const gaps = items.filter((item) => item.status !== "pass");
  const kept: ReportChecklistItem[] = [];
  const seenLinks = new Set<string>();

  for (const item of gaps) {
    if (item.link_to) {
      if (seenLinks.has(item.link_to)) {
        continue;
      }
      seenLinks.add(item.link_to);
    }

    const duplicatesHeadline = kept.some(
      (existing) =>
        existing.status !== "pass" &&
        item.status !== "pass" &&
        headlineOverlap(existing.text, item.text)
    );

    if (duplicatesHeadline) {
      continue;
    }

    kept.push(item);
  }

  const missing = kept.filter((item) => item.status === "missing").slice(0, 3);
  const weak = kept.filter((item) => item.status === "weak").slice(0, 1);

  return [...missing, ...weak, ...passes];
}

function ensureVisualWeakItem(gaps: ReportChecklistItem[]): ReportChecklistItem[] {
  const hasVisual = gaps.some(
    (item) => item.link_to === "visual-fixes" && item.status === "weak"
  );

  if (hasVisual) {
    return gaps.map((item) =>
      item.link_to === "visual-fixes" && item.status === "weak"
        ? { ...item, id: "subheadline-clarity", category: "visual" as const }
        : item
    );
  }

  return gaps;
}

type GapSlot = {
  link_to: ChecklistLinkTarget;
  status: ChecklistItemStatus;
  id: string;
  category: ChecklistCategory;
};

const COPY_TRUST_GAP_SLOTS: GapSlot[] = [
  {
    link_to: "copy-headline",
    status: "missing",
    id: "headline-category",
    category: "copy",
  },
  {
    link_to: "copy-cta",
    status: "missing",
    id: "copy-cta",
    category: "copy",
  },
  {
    link_to: "trust",
    status: "missing",
    id: "trust",
    category: "trust",
  },
  {
    link_to: "copy-subheadline",
    status: "missing",
    id: "copy-subheadline",
    category: "copy",
  },
];

const VISUAL_WEAK_SLOT: GapSlot = {
  link_to: "visual-fixes",
  status: "weak",
  id: "subheadline-clarity",
  category: "visual",
};

function createFallbackGap(slot: GapSlot): ReportChecklistItem {
  const key = `${slot.link_to}:${slot.status}`;

  return {
    id: slot.id,
    text: GAP_TEXT_FALLBACKS[key] ?? "Needs improvement",
    status: slot.status,
    link_to: slot.link_to,
    category: slot.category,
    gap_label: GAP_LABEL_DEFAULTS[key],
  };
}

const GAP_LABEL_TO_SLOT: Record<string, GapSlot> = {
  "Category missing": COPY_TRUST_GAP_SLOTS[0],
  "Trial unclear": COPY_TRUST_GAP_SLOTS[1],
  "Trust missing above fold": COPY_TRUST_GAP_SLOTS[2],
  "Trust missing": COPY_TRUST_GAP_SLOTS[2],
  "Content weak": COPY_TRUST_GAP_SLOTS[3],
};

function normalizeChipGapLabel(label: string): string {
  const trimmed = label.trim();
  return CHIP_GAP_LABEL_ALIASES[trimmed] ?? trimmed;
}

function resolveGapSlotFromLabel(label: string): GapSlot | undefined {
  const normalized = normalizeChipGapLabel(label);
  return GAP_LABEL_TO_SLOT[normalized] ?? GAP_LABEL_TO_SLOT[label.trim()];
}

function repairContradictoryChecklistItem(item: ReportChecklistItem): ReportChecklistItem | null {
  if (item.status !== "pass") {
    return item;
  }

  const gapLabel = item.gap_label?.trim();
  if (gapLabel) {
    const slot = resolveGapSlotFromLabel(gapLabel);
    if (slot) {
      return createFallbackGap(slot);
    }
  }

  const text = item.text.toLowerCase();

  if (
    /\bcta\b/.test(text) &&
    /\b(lacks clarity|unclear|trial|next step|does not)\b/.test(text)
  ) {
    return createFallbackGap(COPY_TRUST_GAP_SLOTS[1]);
  }

  if (
    /\b(trust|logos|testimonials|credibility|proof)\b/.test(text) &&
    /\b(missing|no visible|without|not visible|lacks)\b/.test(text)
  ) {
    return createFallbackGap(COPY_TRUST_GAP_SLOTS[2]);
  }

  if (
    /\bheadline\b/.test(text) &&
    /\b(doesn't|does not|missing|unclear|category|audience)\b/.test(text)
  ) {
    return createFallbackGap(COPY_TRUST_GAP_SLOTS[0]);
  }

  return item;
}

function filterInvalidPassItems(
  passes: ReportChecklistItem[],
  gaps: ReportChecklistItem[]
): ReportChecklistItem[] {
  const hasCtaGap = gaps.some((item) => item.link_to === "copy-cta");
  const hasMultipleCtaSignals = gaps.some((item) =>
    /\b(two|three|multiple|competing|several)\b.*\bcta\b/i.test(item.text)
  );

  return passes.filter((item) => {
    if (!/single (primary )?cta/i.test(item.text)) {
      return true;
    }

    return !(hasCtaGap || hasMultipleCtaSignals);
  });
}

function repairChecklistItems(items: ReportChecklistItem[]): ReportChecklistItem[] {
  const repaired: ReportChecklistItem[] = [];

  for (const item of items) {
    const next = repairContradictoryChecklistItem(item);

    if (next) {
      repaired.push(next);
    }
  }

  return repaired;
}

function reconcileChecklistWithScorePotential(
  checklist: ReportChecklistItem[],
  scorePotential?: ScorePotentialInput,
  score?: number
): ReportChecklistItem[] {
  let gaps = checklist.filter((item) => item.status !== "pass");
  let passes = checklist.filter((item) => item.status === "pass");
  const filledLinks = new Set(
    gaps.map((item) => item.link_to).filter((link): link is ChecklistLinkTarget => Boolean(link))
  );

  for (const chip of scorePotential?.chips ?? []) {
    const slot = resolveGapSlotFromLabel(chip.label);

    if (!slot || filledLinks.has(slot.link_to)) {
      continue;
    }

    gaps.push(createFallbackGap(slot));
    filledLinks.add(slot.link_to);
  }

  gaps = ensureMinimumChecklistGaps(gaps, score);
  passes = filterInvalidPassItems(passes, gaps);

  const missing = gaps.filter((item) => item.status === "missing").slice(0, 3);
  const weak = gaps.filter((item) => item.status === "weak").slice(0, 1);

  return [...missing, ...weak, ...passes].map((item) => {
    const gap_label = deriveChecklistGapLabel(item);
    return gap_label && !item.gap_label ? { ...item, gap_label } : item;
  });
}

function countGaps(gaps: ReportChecklistItem[]) {
  return {
    total: gaps.length,
    missing: gaps.filter((item) => item.status === "missing").length,
    weak: gaps.filter((item) => item.status === "weak").length,
  };
}

function ensureMinimumChecklistGaps(
  gaps: ReportChecklistItem[],
  score?: number
): ReportChecklistItem[] {
  const numericScore = Number(score);

  if (!Number.isFinite(numericScore) || numericScore >= 7) {
    return ensureVisualWeakItem(gaps);
  }

  const minTotalGaps = 3;
  const requireWeakTypography = numericScore < 7;
  const minMissing = numericScore < 6.0 ? 3 : 2;

  let result = [...gaps];
  const filledLinks = new Set(
    result.map((item) => item.link_to).filter((link): link is ChecklistLinkTarget => Boolean(link))
  );

  if (requireWeakTypography && !filledLinks.has("visual-fixes")) {
    result.push(createFallbackGap(VISUAL_WEAK_SLOT));
    filledLinks.add("visual-fixes");
  }

  for (const slot of COPY_TRUST_GAP_SLOTS) {
    if (countGaps(result).total >= minTotalGaps && countGaps(result).missing >= minMissing) {
      break;
    }

    if (filledLinks.has(slot.link_to)) {
      continue;
    }

    result.push(createFallbackGap(slot));
    filledLinks.add(slot.link_to);
  }

  const missing = result.filter((item) => item.status === "missing").slice(0, 3);
  const weak = result.filter((item) => item.status === "weak").slice(0, 1);

  return ensureVisualWeakItem([...missing, ...weak]);
}

export function findChecklistItemForChip(
  checklist: ReportChecklistItem[] | undefined,
  chipLabel: string
): ReportChecklistItem | undefined {
  if (!checklist?.length || !chipLabel.trim()) {
    return undefined;
  }

  const trimmed = chipLabel.trim();
  const normalized = normalizeChipGapLabel(trimmed);

  return checklist.find(
    (item) =>
      item.status !== "pass" &&
      (item.text === trimmed ||
        item.gap_label === trimmed ||
        item.gap_label === normalized ||
        deriveChecklistGapLabel(item) === trimmed ||
        deriveChecklistGapLabel(item) === normalized)
  );
}

export function getScoreChipShortLabel(
  chipLabel: string,
  checklist?: ReportChecklistItem[]
): string {
  const item = findChecklistItemForChip(checklist, chipLabel);

  if (item) {
    return deriveChecklistGapLabel(item) ?? chipLabel;
  }

  return chipLabel;
}

export function resolveChipChecklistItem(
  chipLabel: string,
  chipIndex: number,
  checklist?: ReportChecklistItem[]
): ReportChecklistItem | undefined {
  const matched = findChecklistItemForChip(checklist, chipLabel);

  if (matched?.link_to) {
    return matched;
  }

  const chipGaps =
    checklist?.filter(
      (item) => item.status !== "pass" && item.link_to && item.link_to !== "visual-fixes"
    ) ?? [];

  return chipGaps[chipIndex];
}

type ScorePotentialInput = {
  target: number;
  chips: { label: string; delta: string }[];
};

const SCORE_CHIP_DEFAULT_DELTAS = ["+0.8", "+0.6", "+0.4", "+0.3"];

function parseScoreChipDelta(delta: string): number {
  const match = delta.match(/\+?([\d.]+)/);
  return match ? Number.parseFloat(match[1]) : 0;
}


function deriveScoreChipsFromChecklist(
  checklist: ReportChecklistItem[]
): ScorePotentialInput["chips"] {
  return checklist
    .filter(
      (item) =>
        item.status !== "pass" &&
        item.link_to &&
        item.link_to !== "visual-fixes" &&
        (item.category === "copy" || item.category === "trust")
    )
    .slice(0, 3)
    .map((item, index) => ({
      label: deriveChecklistGapLabel(item) ?? item.text,
      delta: SCORE_CHIP_DEFAULT_DELTAS[index] ?? "+0.3",
    }));
}

function normalizeScorePotentialChips(
  chips: ScorePotentialInput["chips"],
  checklist: ReportChecklistItem[]
): ScorePotentialInput["chips"] {
  return chips.map((chip, index) => {
    const item =
      findChecklistItemForChip(checklist, chip.label) ??
      resolveChipChecklistItem(chip.label, index, checklist);
    const shortLabel = item ? deriveChecklistGapLabel(item) : undefined;

    return {
      ...chip,
      label: shortLabel ?? chip.label,
    };
  });
}

export function normalizeScorePotential(
  scorePotential: ScorePotentialInput | undefined,
  checklist: ReportChecklistItem[],
  score = 0
): ScorePotentialInput | undefined {
  const rawChips = scorePotential?.chips?.length
    ? scorePotential.chips
    : deriveScoreChipsFromChecklist(checklist);

  if (!rawChips.length) {
    return scorePotential;
  }

  const chips = normalizeScorePotentialChips(rawChips, checklist);
  const deltaSum = chips.reduce(
    (sum, chip) => sum + parseScoreChipDelta(chip.delta),
    0
  );
  const computedTarget = Math.min(
    9.5,
    Math.round((score + deltaSum) * 10) / 10
  );
  const incomingTarget = scorePotential?.target;
  const targetLooksStale =
    incomingTarget === undefined ||
    Math.abs(incomingTarget - score) < 0.05 ||
    incomingTarget <= score;

  return {
    target: targetLooksStale && deltaSum > 0 ? computedTarget : (incomingTarget ?? computedTarget),
    chips,
  };
}

export function normalizeReportChecklist(raw: unknown, score?: number): ReportChecklistItem[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const parsed = raw
    .map(parseChecklistItem)
    .filter((item): item is ReportChecklistItem => item !== null);

  const repaired = repairChecklistItems(parsed);
  const withDedupedGaps = dedupeGaps(repaired);
  const gaps = withDedupedGaps.filter((item) => item.status !== "pass");
  const passes = withDedupedGaps.filter((item) => item.status === "pass");
  const normalizedGaps = ensureMinimumChecklistGaps(gaps, score);

  return [...normalizedGaps, ...passes].map((item) => {
    const gap_label = deriveChecklistGapLabel(item);

    return gap_label && !item.gap_label ? { ...item, gap_label } : item;
  });
}

export function finalizeReportChecklist(
  raw: unknown,
  score?: number,
  scorePotential?: ScorePotentialInput
): {
  checklist: ReportChecklistItem[];
  scorePotential: ScorePotentialInput | undefined;
} {
  let checklist = normalizeReportChecklist(raw, score);
  let normalizedPotential = normalizeScorePotential(scorePotential, checklist, score ?? 0);
  checklist = reconcileChecklistWithScorePotential(checklist, normalizedPotential, score);
  normalizedPotential = normalizeScorePotential(normalizedPotential, checklist, score ?? 0);

  return {
    checklist,
    scorePotential: normalizedPotential,
  };
}
