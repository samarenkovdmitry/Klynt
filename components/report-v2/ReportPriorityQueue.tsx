"use client";

import { useState } from "react";
import { RiListCheck2, RiScalesLine } from "@remixicon/react";
import type { ReportChecklistItem, ChecklistItemStatus } from "@/lib/audit-report";

type Props = {
  checklist: ReportChecklistItem[];
  heroFindingId?: string;
  lockedAfter?: number;
  onUnlock?: () => void;
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

function IssueRow({
  item,
  index,
  expanded,
  onToggle,
}: {
  item: ReportChecklistItem;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const severity = getSeverity(item.status);
  const score = impactScore(index, item.status);
  const expandable = Boolean(item.body);

  return (
    <div
      className={[
        "px-6 py-4",
        index > 0 ? "border-t border-v2-card-divider" : "",
        expandable ? "cursor-pointer" : "",
      ].filter(Boolean).join(" ")}
      onClick={() => expandable && onToggle()}
    >
      <div className="flex items-center gap-4">
        <span className="font-mono w-4 shrink-0 text-[12px] text-v2-ink-hairline">{index + 1}</span>

        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[15px] font-semibold tracking-[-0.01em] text-v2-ink">
            {item.text}
          </p>
          <span className="font-mono text-[10.5px] tracking-[0.05em] text-v2-ink-faint">
            <span className="uppercase">{item.category}</span>
            {item.evidence ? ` · ${item.evidence}` : ""}
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

      {expanded && item.body && (
        <p className="mt-3 ml-8 text-[13px] leading-[1.6] text-v2-ink-secondary">
          {item.body}
        </p>
      )}
    </div>
  );
}

export function ReportPriorityQueue({ checklist, heroFindingId, lockedAfter, onUnlock }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const issues = checklist.filter(
    (i) => i.status !== "pass" && i.id !== heroFindingId
  );
  if (issues.length === 0) return null;

  const total = checklist.length;
  const visibleIssues = lockedAfter !== undefined ? issues.slice(0, lockedAfter) : issues;
  const lockedIssues = lockedAfter !== undefined ? issues.slice(lockedAfter) : [];

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section
      id="priority"
      className="overflow-hidden rounded-[16px] border border-v2-card-border bg-v2-card shadow-[0_1px_2px_rgba(27,26,23,0.03)]"
    >
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

      <div className="flex items-start gap-2.5 border-b border-v2-card-divider bg-v2-card-faint px-6 py-3">
        <RiScalesLine size={16} className="mt-px shrink-0 text-v2-ink-muted" />
        <p className="text-[13px] leading-[1.5] text-v2-ink-secondary">
          Every finding is scored on one{" "}
          <b className="text-v2-ink">Impact scale (0–100)</b> = visitor reach × conversion drag.
        </p>
      </div>

      {visibleIssues.map((item, i) => (
        <IssueRow
          key={item.id}
          item={item}
          index={i}
          expanded={expanded.has(item.id)}
          onToggle={() => toggle(item.id)}
        />
      ))}

      {lockedIssues.length > 0 && (
        <div className="relative">
          {lockedIssues.map((item, i) => (
            <div
              key={item.id}
              className="border-t border-v2-card-divider opacity-30 blur-sm pointer-events-none select-none"
            >
              <IssueRow
                item={item}
                index={visibleIssues.length + i}
                expanded={false}
                onToggle={() => {}}
              />
            </div>
          ))}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-t from-white via-white/80 to-transparent">
            <button
              type="button"
              onClick={onUnlock}
              className="pointer-events-auto rounded-full border border-v2-card-border bg-v2-card px-5 py-2.5 text-[14px] font-semibold text-v2-ink shadow-sm transition-colors hover:bg-v2-card-inner"
            >
              See all {issues.length} findings →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
