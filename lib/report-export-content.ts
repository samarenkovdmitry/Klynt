import type { AuditReport } from "@/lib/audit-report";

export type ExportType = "copy_deck" | "designer_brief" | "dev_tasks" | "notion_slack";

const DIMENSION_LABELS: Record<string, string> = {
  border_radius:    "Corner radius",
  density:          "Information density",
  color_tone:       "Color tone",
  spacing:          "Spacing & rhythm",
  cta_hierarchy:    "CTA hierarchy",
  typography:       "Typography",
  depth:            "Background & depth",
  navigation:       "Navigation complexity",
  social_proof:     "Social proof",
  headline_formula: "Headline formula",
  color_contrast:   "Color contrast",
};

export function generateExportContent(type: ExportType, report: AuditReport): string {
  switch (type) {
    case "copy_deck":      return generateCopyDeck(report);
    case "designer_brief": return generateDesignerBrief(report);
    case "dev_tasks":      return generateDevTasks(report);
    case "notion_slack":   return generateNotionSlack(report);
  }
}

export function getExportFilename(type: ExportType, url: string | undefined): string {
  let slug = "report";
  try {
    const hostname = new URL(url?.startsWith("http") ? url : `https://${url}`).hostname;
    slug = hostname.replace(/[^a-z0-9]/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  } catch { /* fallback to "report" */ }
  const names: Record<ExportType, string> = {
    copy_deck:      `copy-deck-${slug}.md`,
    designer_brief: `designer-brief-${slug}.md`,
    dev_tasks:      `dev-tasks-${slug}.md`,
    notion_slack:   `notion-slack-${slug}.md`,
  };
  return names[type];
}

function generateCopyDeck(report: AuditReport): string {
  const cv = report.copy_variants;
  if (!cv) return "No copy variants available.";
  const lines: string[] = [`# Copy Deck${report.url ? ` — ${report.url}` : ""}`, ""];

  for (const [title, key] of [["Headline", "headline"], ["Subheadline", "subheadline"], ["CTA", "cta"]] as const) {
    const block = cv[key];
    if (!block) continue;
    lines.push(`## ${title}`, `Current: "${block.current}"`, "");
    for (const v of block.variants ?? []) {
      lines.push(`${v.label}: "${v.text}"`);
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}

function generateDesignerBrief(report: AuditReport): string {
  const fixes = report.visual_fixes ?? [];
  const lines: string[] = [
    `# Designer Brief${report.url ? ` — ${report.url}` : ""}`,
    `Score: ${report.score}/100`,
    "",
    `## Visual Fixes (${fixes.length})`,
    "",
  ];
  if (!fixes.length) {
    lines.push("No visual fixes recorded.");
    return lines.join("\n");
  }
  for (const fix of fixes) {
    lines.push(
      `### ${DIMENSION_LABELS[fix.dimension] ?? fix.dimension}`,
      `Observation: ${fix.observation}`,
      `Fix: ${fix.recommendation}`,
      "",
    );
  }
  return lines.join("\n").trim();
}

function generateDevTasks(report: AuditReport): string {
  const cv   = report.copy_variants;
  const fixes = report.visual_fixes ?? [];
  const lines: string[] = [`# Dev Tasks${report.url ? ` — ${report.url}` : ""}`, ""];

  if (cv) {
    lines.push("## Copy Updates", "");
    for (const [title, key] of [["Headline", "headline"], ["Subheadline", "subheadline"], ["CTA", "cta"]] as const) {
      const block = cv[key];
      if (!block?.variants?.length) continue;
      const [top, ...rest] = block.variants;
      lines.push(`- [ ] ${title} — replace "${block.current}" with "${top.text}"`);
      for (const v of rest) lines.push(`  - Alt (${v.label}): "${v.text}"`);
    }
    lines.push("");
  }

  if (fixes.length) {
    lines.push("## Visual Changes", "");
    for (const fix of fixes) {
      lines.push(`- [ ] ${DIMENSION_LABELS[fix.dimension] ?? fix.dimension} — ${fix.recommendation}`);
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}

function generateNotionSlack(report: AuditReport): string {
  const lines: string[] = [
    `UX Audit — ${report.url ?? "Landing page"}`,
    `Score: ${report.score}/100${report.score_potential?.target ? ` · Potential: ${report.score_potential.target}/100` : ""}`,
    "",
  ];
  if (report.summary) lines.push(report.summary, "");

  const missing = report.checklist?.filter(i => i.status === "missing") ?? [];
  const weak    = report.checklist?.filter(i => i.status === "weak") ?? [];

  if (missing.length) {
    lines.push("Top findings:");
    for (const item of missing.slice(0, 5))
      lines.push(`• ${item.text}${item.evidence ? ` (${item.evidence})` : ""}`);
    lines.push("");
  }
  if (weak.length) {
    lines.push("Quick wins:");
    for (const item of weak.slice(0, 3)) lines.push(`• ${item.text}`);
    lines.push("");
  }
  return lines.join("\n").trim();
}
