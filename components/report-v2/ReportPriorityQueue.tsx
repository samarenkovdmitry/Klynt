"use client";

import { RiListCheck2, RiScalesLine } from "@remixicon/react";
import type { ReportChecklistItem, ChecklistItemStatus } from "@/lib/audit-report";

type Props = {
  checklist: ReportChecklistItem[];
};

type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "PASS";

function getSeverity(status: ChecklistItemStatus): Severity {
  if (status === "missing") return "CRITICAL";
  if (status === "weak") return "HIGH";
  return "PASS";
}

const SEVERITY_STYLES: Record<Severity, string> = {
  CRITICAL: "text-v2-critical bg-v2-critical-bg",
  HIGH:     "text-v2-high bg-v2-high-bg",
  MEDIUM:   "text-v2-medium bg-v2-medium-bg",
  PASS:     "text-v2-pass bg-v2-pass-bg",
};

function impactScore(index: number, status: ChecklistItemStatus): number {
  const base = status === "missing" ? 95 : 70;
  return Math.max(base - index * 9, 32);
}

export function ReportPriorityQueue({ checklist }: Props) {
  const issues = checklist.filter((i) => i.status !== "pass");
  if (issues.length === 0) return null;

  const total = checklist.length;

  return (
    <section
      id="priority"
      className="overflow-hidden rounded-[16px] border border-v2-card-border bg-v2-card shadow-[0_1px_2px_rgba(27,26,23,0.03)]"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-v2-card-divider px-6 py-[17px]">
        <RiListCheck2 size={19} className="text-v2-ink" />
        <span className="text-[18px] font-semibold tracking-[-0.01em] text-v2-ink">
          What needs fixing
        </span>
        <span className="text-[13px] font-medium text-v2-ink-faint">ranked by impact</span>
        <span className="font-mono ml-auto text-[11.5px] tracking-[0.04em] text-v2-ink-faint">
          {issues.length} OF {total}
        </span>
      </div>

      {/* Scale explanation */}
      <div className="flex items-start gap-2.5 border-b border-v2-card-divider bg-v2-card-faint px-6 py-3">
        <RiScalesLine size={16} className="mt-px shrink-0 text-v2-ink-muted" />
        <p className="text-[13px] leading-[1.5] text-v2-ink-secondary">
          Every finding is scored on one{" "}
          <b className="text-v2-ink">Impact scale (0–100)</b> = visitor reach × conversion drag.
        </p>
      </div>

      {/* Issue rows */}
      {issues.map((item, i) => {
        const severity = getSeverity(item.status);
        const score = impactScore(i, item.status);

        return (
          <div
            key={item.id}
            className={`flex items-center gap-4 px-6 py-4 ${i > 0 ? "border-t border-v2-card-divider" : ""}`}
          >
            <span className="font-mono w-4 shrink-0 text-[12px] text-v2-ink-hairline">{i + 1}</span>

            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[15px] font-semibold tracking-[-0.01em] text-v2-ink">
                {item.text}
              </p>
              <span className="font-mono text-[10.5px] tracking-[0.05em] text-v2-ink-faint uppercase">
                {item.category}
                {item.evidence ? ` · ${item.evidence.slice(0, 60)}${item.evidence.length > 60 ? "…" : ""}` : ""}
              </span>
            </div>

            <span
              className={`font-mono shrink-0 rounded-full px-[11px] py-[5px] text-[10.5px] tracking-[0.06em] ${SEVERITY_STYLES[severity]}`}
            >
              {severity}
            </span>

            <span className="font-mono w-8 shrink-0 text-right text-[14px] font-semibold text-v2-ink">
              {score}
            </span>
          </div>
        );
      })}
    </section>
  );
}
