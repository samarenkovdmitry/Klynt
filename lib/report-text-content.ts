import type { AuditReport } from "@/lib/audit-report";
import { formatOverallScore, formatReportDomain } from "@/lib/report-hero-theme";

function appendSection(lines: string[], title: string, body: string[]) {
  const content = body.map((line) => line.trim()).filter(Boolean);

  if (content.length === 0) {
    return;
  }

  lines.push("", title, ...content);
}

export function buildReportPlainText(report: AuditReport): string {
  const lines: string[] = [];
  const domain = formatReportDomain(report.url);
  const score = formatOverallScore(report.score);

  lines.push(
    domain ? `UX clarity report for ${domain}` : "UX clarity report",
    `Score: ${score}/10`
  );

  if (report.verdict?.trim()) {
    lines.push(`Verdict: ${report.verdict.trim()}`);
  }

  if (report.summary?.trim()) {
    lines.push(`Summary: ${report.summary.trim()}`);
  }

  if (report.key_observation?.trim()) {
    lines.push(`Key observation: ${report.key_observation.trim()}`);
  }

  if (report.breakdown) {
    const metrics = [
      report.breakdown.clarity != null
        ? `Clarity ${report.breakdown.clarity}`
        : null,
      report.breakdown.trust != null ? `Trust ${report.breakdown.trust}` : null,
      report.breakdown.conversion != null
        ? `Conversion ${report.breakdown.conversion}`
        : null,
      report.breakdown.navigation != null
        ? `Navigation ${report.breakdown.navigation}`
        : null,
      report.breakdown.visuals != null
        ? `Visuals ${report.breakdown.visuals}`
        : null,
    ].filter((value): value is string => Boolean(value));

    if (metrics.length > 0) {
      lines.push(`Breakdown: ${metrics.join(", ")}`);
    }
  }

  appendSection(
    lines,
    "Issues",
    (report.issues ?? []).flatMap((issue, index) => {
      const parts = [`${index + 1}. ${issue.title?.trim() ?? "Issue"}`];

      if (issue.category?.trim()) {
        parts.push(`Category: ${issue.category.trim()}`);
      }

      if (issue.why?.trim()) {
        parts.push(`Why: ${issue.why.trim()}`);
      }

      return parts;
    })
  );

  appendSection(
    lines,
    "Recommendations",
    (report.suggestions ?? []).flatMap((item, index) => {
      const parts = [
        `${index + 1}. ${item.recommendation?.trim() ?? "Recommendation"}`,
      ];

      if (item.section?.trim()) {
        parts.push(`Section: ${item.section.trim()}`);
      }

      if (item.why?.trim()) {
        parts.push(`Why: ${item.why.trim()}`);
      }

      return parts;
    })
  );

  if (report.headline_directions) {
    const directions = report.headline_directions;
    const directionLines = [
      directions.before?.trim()
        ? `Current headline: ${directions.before.trim()}`
        : null,
      directions.gap?.trim() ? `Gap: ${directions.gap.trim()}` : null,
      ...(directions.options ?? []).map(
        (option, index) =>
          `Option ${index + 1} (${option.label}): ${option.text.trim()}`
      ),
    ].filter((value): value is string => Boolean(value));

    appendSection(lines, "Headline directions", directionLines);
  }

  appendSection(
    lines,
    "Copy improvements",
    (report.copy ?? []).flatMap((item, index) => {
      const parts = [`${index + 1}. ${item.section?.trim() ?? "Section"}`];

      if (item.before?.trim()) {
        parts.push(`Before: ${item.before.trim()}`);
      }

      if (item.after?.trim()) {
        parts.push(`After: ${item.after.trim()}`);
      }

      if (item.why?.trim()) {
        parts.push(`Why: ${item.why.trim()}`);
      }

      return parts;
    })
  );

  if (report.generatedAt) {
    lines.push("", `Generated: ${report.generatedAt}`);
  }

  return `${lines.join("\n")}\n`;
}
