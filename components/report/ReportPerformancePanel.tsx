"use client";

import { RiSpeedLine } from "@remixicon/react";

import { HelpTooltipIcon } from "@/components/ui/HelpTooltipIcon";

import type { PagePerformanceMetrics } from "@/lib/audit-report";
import type { ReportBenchmark } from "@/lib/benchmark/report-benchmark";
import {
  REPORT_NEW_SECTION_BODY_GAP_CLASS,
  ReportNewSectionHeader,
} from "@/components/report/ReportNewSectionHeader";
import {
  REPORT_SECTION_SCROLL_MARGIN_CLASS,
  REPORT_SECTION_SPACING_CLASS,
  REPORT_SURFACE_CARD_CLASS,
} from "@/components/report/reportStyles";
import {
  buildPerformanceMetricRows,
  hasPerformanceMetrics,
  PERFORMANCE_METRIC_SPECS,
  performanceNeedsAttention,
  statusTargetHint,
  type PerformanceMetricRow,
  type PerformanceMetricStatus,
} from "@/lib/performance-thresholds";

type Props = {
  metrics: PagePerformanceMetrics | null | undefined;
  benchmark?: ReportBenchmark | null;
};

const STATUS_STYLES: Record<PerformanceMetricStatus, { text: string; bar: string }> = {
  pass: {
    text: "text-[#1D9E75]",
    bar: "bg-[#1D9E75]",
  },
  weak: {
    text: "text-[#D08700]",
    bar: "bg-[#D08700]",
  },
  missing: {
    text: "text-[#FF5A4F]",
    bar: "bg-[#FF5A4F]",
  },
  unknown: {
    text: "text-[#8B95A7]",
    bar: "bg-[rgba(6,28,47,0.12)]",
  },
};

const BODY_CLASS = "text-[15px] leading-[22.5px] text-[#061C2F]";
const CAPTION_CLASS = "text-[13px] leading-[1.45] text-[#7D8C99]";
const FOOTER_META_CLASS = "text-[13px] leading-5 text-[#8E99A2]";
const PANEL_DIVIDER_CLASS = "border-[rgba(6,28,47,0.06)]";

function barFillPct(
  spec: (typeof PERFORMANCE_METRIC_SPECS)[number],
  value: number,
  status: PerformanceMetricStatus
): number {
  if (status === "pass") return 100;
  if (status === "unknown") return 0;

  const max = spec.weakThreshold * 1.35;
  const clamped = Math.min(value, max);
  const inverted = spec.lowerIsBetter ? 1 - clamped / max : clamped / max;

  return Math.round(Math.max(12, Math.min(92, inverted * 100)));
}

function compactBenchmarkSuffix(
  benchmark: ReportBenchmark | null | undefined
): string | null {
  if (!benchmark || benchmark.sample_size < 5) return null;

  if (benchmark.performance.lcp_percentile != null) {
    return `Beats ${benchmark.performance.lcp_percentile}% of recent Klynt audits`;
  }

  return null;
}

function conversionHint(rows: PerformanceMetricRow[]): string {
  const lcp = rows.find((row) => row.spec.id === "lcp_ms");

  if (lcp?.status === "missing") {
    return "Slow first paint often increases bounce before visitors read your offer.";
  }

  if (lcp?.status === "weak") {
    return "First paint is slow enough to cost you visitors on mobile and cold traffic.";
  }

  if (performanceNeedsAttention(rows)) {
    return "Technical load issues can add friction on the first visit.";
  }

  return "Load speed looks healthy — visitors should see content quickly.";
}

function metricCellBorderClass(index: number): string {
  const divider = PANEL_DIVIDER_CLASS;

  return [
    index % 2 === 0 ? `border-r ${divider}` : "",
    index < 2 ? `border-b ${divider} sm:border-b-0` : "",
    index < 3 ? `sm:border-r ${divider}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function MetricCompactCell({
  row,
  tooltipAlign,
}: {
  row: PerformanceMetricRow;
  tooltipAlign: "start" | "end";
}) {
  const styles = STATUS_STYLES[row.status];
  const measured = row.value != null;

  return (
    <div className="min-w-0 px-5 py-4">
      <div className="flex items-center gap-2">
        <p className="text-[15px] font-normal leading-5 text-[#8E99A2]">{row.spec.shortLabel}</p>
        <HelpTooltipIcon
          label={`About ${row.spec.shortLabel}`}
          text={row.spec.tooltip}
          tooltipPlacement="bottom"
          tooltipAlign={tooltipAlign}
        />
      </div>
      <p
        className={[
          "mt-1 text-[20px] font-semibold leading-none tracking-[-0.02em]",
          measured ? styles.text : "text-[#8B95A7]",
        ].join(" ")}
      >
        {measured ? row.spec.format(row.value!) : "—"}
      </p>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-[rgba(6,28,47,0.06)]">
        <div
          className={["h-full rounded-full transition-all", styles.bar].join(" ")}
          style={{
            width:
              measured ? `${barFillPct(row.spec, row.value!, row.status)}%` : "0%",
          }}
        />
      </div>
      <p className={`mt-2 ${CAPTION_CLASS}`}>{statusTargetHint(row.spec)}</p>
    </div>
  );
}

export function ReportPerformancePanel({ metrics, benchmark }: Props) {
  const rows = buildPerformanceMetricRows(metrics);

  if (!hasPerformanceMetrics(metrics)) {
    return null;
  }

  const benchmarkSuffix = compactBenchmarkSuffix(benchmark);
  const measuredCount = rows.filter((row) => row.value != null).length;
  const captureMeta =
    measuredCount > 0
      ? [
          `${measuredCount} Web Vitals via CDP`,
          (metrics?.request_count ?? 0) > 0 ? `${metrics!.request_count} requests` : null,
          metrics?.dom_content_loaded_ms
            ? `DCL ${Math.round(metrics.dom_content_loaded_ms)} ms`
            : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : null;

  return (
    <section
      id="load-speed"
      className={`${REPORT_SECTION_SPACING_CLASS} ${REPORT_SECTION_SCROLL_MARGIN_CLASS}`}
    >
      <ReportNewSectionHeader
        icon={<RiSpeedLine size={22} className="text-[#061C2F]" />}
        title="Load speed"
      />

      <div className={`${REPORT_NEW_SECTION_BODY_GAP_CLASS} ${REPORT_SURFACE_CARD_CLASS}`}>
        <div className="px-6 py-5">
          <p className={BODY_CLASS}>{conversionHint(rows)}</p>
        </div>

        <div className={`grid min-w-0 grid-cols-2 border-t sm:grid-cols-4 ${PANEL_DIVIDER_CLASS}`}>
          {rows.map((row, index) => (
            <div key={row.spec.id} className={`min-w-0 ${metricCellBorderClass(index)}`}>
              <MetricCompactCell
                row={row}
                tooltipAlign={index % 2 === 1 ? "end" : "start"}
              />
            </div>
          ))}
        </div>

        {benchmarkSuffix || captureMeta ? (
          <div className={`border-t px-6 py-3.5 ${PANEL_DIVIDER_CLASS}`}>
            <p className="break-words text-[13px] leading-5">
              {benchmarkSuffix ? (
                <span className="font-medium text-[#616C77]">{benchmarkSuffix}</span>
              ) : null}
              {benchmarkSuffix && captureMeta ? (
                <span className="text-[#8E99A2]"> · </span>
              ) : null}
              {captureMeta ? <span className={FOOTER_META_CLASS}>{captureMeta}</span> : null}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
