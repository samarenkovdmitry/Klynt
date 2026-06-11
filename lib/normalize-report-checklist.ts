import type {
  ChecklistCategory,
  ChecklistItemStatus,
  ChecklistLinkTarget,
  ReportChecklistItem,
} from "@/lib/audit-report";

const GAP_LABEL_DEFAULTS: Record<string, string> = {
  "copy-headline:missing": "Category missing",
  "copy-cta:missing": "Trial unclear",
  "copy-subheadline:missing": "Content weak",
  "copy-subheadline:weak": "Content weak",
  "trust:missing": "Trust missing",
  "visual-fixes:weak": "Weak typography",
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

export function findChecklistItemForChip(
  checklist: ReportChecklistItem[] | undefined,
  chipLabel: string
): ReportChecklistItem | undefined {
  if (!checklist?.length || !chipLabel.trim()) {
    return undefined;
  }

  const trimmed = chipLabel.trim();

  return checklist.find(
    (item) =>
      item.status !== "pass" &&
      (item.text === trimmed ||
        item.gap_label === trimmed ||
        deriveChecklistGapLabel(item) === trimmed)
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

export function normalizeReportChecklist(raw: unknown): ReportChecklistItem[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const parsed = raw
    .map(parseChecklistItem)
    .filter((item): item is ReportChecklistItem => item !== null);

  const withDedupedGaps = dedupeGaps(parsed);
  const gaps = withDedupedGaps.filter((item) => item.status !== "pass");
  const passes = withDedupedGaps.filter((item) => item.status === "pass");
  const normalizedGaps = ensureVisualWeakItem(gaps);

  return [...normalizedGaps, ...passes].map((item) => {
    const gap_label = deriveChecklistGapLabel(item);

    return gap_label && !item.gap_label ? { ...item, gap_label } : item;
  });
}
