"use client";

import { RiShieldCheckLine } from "@remixicon/react";

export type TrustMetaMetricV2 = {
  label: string;
  score_pct: number;
  note: string;
};

export type ReportTrustMetaV2 = {
  trust_signals: TrustMetaMetricV2;
  decision_clarity: TrustMetaMetricV2;
  cognitive_friction: TrustMetaMetricV2;
  visual_hierarchy: TrustMetaMetricV2;
  ai_confidence_pct: number;
};

type Props = {
  trustMeta: ReportTrustMetaV2;
};

function metricTone(pct: number): { bar: string; text: string } {
  if (pct >= 70) return { bar: "bg-v2-pass", text: "text-v2-pass" };
  if (pct >= 50) return { bar: "bg-v2-high", text: "text-v2-high" };
  return { bar: "bg-v2-critical", text: "text-v2-critical" };
}

function gridCellClasses(i: number, total: number): string {
  return [
    i % 2 === 0 && total > 1 ? "sm:border-r sm:border-v2-card-divider" : "",
    i >= 2 ? "border-t border-v2-card-divider" : "",
    i === 1 ? "border-t border-v2-card-divider sm:border-t-0" : "",
    i === 1 && total % 2 === 1 ? "sm:border-b sm:border-v2-card-divider" : "",
  ].filter(Boolean).join(" ");
}

function MetricCell({ metric }: { metric: TrustMetaMetricV2 }) {
  const pct = Math.min(Math.max(metric.score_pct, 0), 100);
  const tone = metricTone(pct);

  return (
    <div className="p-6">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-v2-ink">{metric.label}</span>
        <span className={`font-mono shrink-0 text-[13px] ${tone.text}`}>{pct}%</span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-v2-card-inner">
        <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[13.5px] leading-[1.5] text-v2-ink-muted">{metric.note}</p>
    </div>
  );
}

export function ReportTrustMetaPanelV2({ trustMeta }: Props) {
  const metrics: TrustMetaMetricV2[] = [
    trustMeta.trust_signals,
    trustMeta.decision_clarity,
    trustMeta.cognitive_friction,
    trustMeta.visual_hierarchy,
  ];

  return (
    <section className="overflow-hidden rounded-[16px] border border-v2-card-border bg-v2-card shadow-[0_1px_2px_rgba(27,26,23,0.03)]">
      <div className="flex items-center gap-2.5 border-b border-v2-card-divider px-6 py-[18px]">
        <RiShieldCheckLine size={20} className="text-v2-ink" />
        <span className="text-[19px] font-semibold tracking-[-0.01em] text-v2-ink">Trust &amp; clarity</span>
        <span className="font-mono ml-auto text-[11.5px] tracking-[0.04em] text-v2-ink-faint">
          {trustMeta.ai_confidence_pct}% AI CONFIDENCE
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2">
        {metrics.map((metric, i) => (
          <div key={metric.label} className={gridCellClasses(i, metrics.length)}>
            <MetricCell metric={metric} />
          </div>
        ))}
      </div>
    </section>
  );
}
