export type CopyOptimizerLayer = "headline" | "subheadline" | "cta";

export type CopyOptimizerField = {
  before: string;
  after: string;
  why?: string;
};

export type CopyOptimizerResult = {
  url: string;
  fields: Record<CopyOptimizerLayer, CopyOptimizerField>;
};

type RawCopyLayer = {
  layer?: string;
  section?: string;
  before?: string;
  after?: string;
  why?: string;
};

const LAYER_LABELS: Record<CopyOptimizerLayer, string> = {
  headline: "Headline",
  subheadline: "Subheadline",
  cta: "CTA",
};

export function getCopyOptimizerLayerLabel(layer: CopyOptimizerLayer) {
  return LAYER_LABELS[layer];
}

function normalizeLayerKey(input: string): CopyOptimizerLayer | null {
  const value = input.trim().toLowerCase();

  if (
    value === "headline" ||
    value.includes("hero headline") ||
    value === "headline" ||
    (value.includes("headline") && !value.includes("sub"))
  ) {
    return "headline";
  }

  if (
    value === "subheadline" ||
    value === "subhead" ||
    value.includes("subheadline") ||
    value.includes("subhead") ||
    value.includes("subtext") ||
    value.includes("sub-text") ||
    value.includes("supporting") ||
    value.includes("description") ||
    value.includes("tagline")
  ) {
    return "subheadline";
  }

  if (
    value === "cta" ||
    value.includes("cta") ||
    value.includes("button") ||
    value.includes("call to action")
  ) {
    return "cta";
  }

  return null;
}

function emptyField(): CopyOptimizerField {
  return { before: "", after: "", why: "" };
}

export function normalizeCopyOptimizerResponse(
  url: string,
  rawCopy: RawCopyLayer[]
): CopyOptimizerResult {
  const fields: Record<CopyOptimizerLayer, CopyOptimizerField> = {
    headline: emptyField(),
    subheadline: emptyField(),
    cta: emptyField(),
  };

  for (const item of rawCopy) {
    const key =
      normalizeLayerKey(String(item.layer ?? "")) ??
      normalizeLayerKey(String(item.section ?? ""));

    if (!key) continue;

    fields[key] = {
      before: String(item.before ?? "").trim(),
      after: String(item.after ?? "").trim(),
      why: String(item.why ?? "").trim() || undefined,
    };
  }

  return { url, fields };
}

export function hasCopyOptimizerContent(result: CopyOptimizerResult) {
  return (Object.keys(result.fields) as CopyOptimizerLayer[]).some(
    (layer) => result.fields[layer].before || result.fields[layer].after
  );
}
