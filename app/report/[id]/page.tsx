"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  RiDownload2Line,
  RiFileCopyLine,
  RiCheckLine,
  RiShareForwardLine,
  RiRefreshLine,
  RiArrowRightUpLine,
  RiLightbulbLine,
} from "@remixicon/react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/Button";
import { isValidAuditResponse, loadReport } from "@/lib/report-storage";

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = Array.isArray(params.id)
  ? params.id[0]
  : params.id;

  // =========================
  // STATE
  // =========================

  const [data, setData] = useState<any>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "missing">(
    "loading"
  );
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // =========================
  // STYLES
  // =========================

  const styles = {
    titleSection:
      "text-[24px] md:text-[28px] font-semibold tracking-[-0.03em] text-[#061C2F]",
  };

  // =========================
  // HELPERS
  // =========================

  function normalizeRisk(risk: string) {
    if (!risk) return "—";

    const r = risk.toLowerCase();

    if (r === "low") return "Healthy";
    if (r === "medium") return "At risk";
    if (r === "high") return "Critical";

    return risk;
  }

  type HealthTier = "healthy" | "medium" | "critical";

  function getScoreTier(score: number): HealthTier {
    if (score >= 70) return "healthy";
    if (score >= 40) return "medium";
    return "critical";
  }

  function getRiskTier(risk: string): HealthTier {
    const r = risk.toLowerCase();

    if (r === "low") return "healthy";
    if (r === "medium") return "medium";
    if (r === "high") return "critical";

    return "medium";
  }

  function getTierColor(tier: HealthTier): string {
    if (tier === "healthy") return "#10B981";
    if (tier === "medium") return "#FF7A00";
    return "#FF5A4F";
  }

  function getScoreColor(score: number): string {
    return getTierColor(getScoreTier(score));
  }

  type ImpactEntry = { key: string; value: number };

  function getImpactEntries(item: {
    impact_metric_1?: string;
    impact_value_1?: unknown;
    impact_metric_2?: string;
    impact_value_2?: unknown;
  }): ImpactEntry[] {
    return [
      { key: item.impact_metric_1, value: item.impact_value_1 },
      { key: item.impact_metric_2, value: item.impact_value_2 },
    ]
      .map((entry) => ({
        key: String(entry.key ?? "").trim(),
        value:
          typeof entry.value === "number"
            ? entry.value
            : Number(entry.value),
      }))
      .filter(
        (entry) =>
          entry.key && Number.isFinite(entry.value) && entry.value !== 0
      )
      .slice(0, 2);
  }

  function ImpactBadges({
    entries,
    variant,
    className = "",
  }: {
    entries: ImpactEntry[];
    variant: "negative" | "positive" | "sky";
    className?: string;
  }) {
    if (entries.length === 0) return null;

    const variantClass =
      variant === "negative"
        ? "border-red-200 bg-red-50 text-red-500"
        : variant === "positive"
          ? "border-emerald-200 bg-emerald-50 text-emerald-600"
          : "border-sky-200 bg-sky-50 text-sky-700";

    return (
      <div
        className={`flex max-w-full flex-wrap gap-2 lg:justify-end ${className}`}
      >
        {entries.map((entry, i) => (
          <div
            key={i}
            className={`
              inline-flex
              shrink-0
              items-center
              rounded-full
              border
              px-3.5
              py-2
              text-[12px]
              font-semibold
              md:text-[13px]
              ${variantClass}
            `}
          >
            {variant === "negative" ? "-" : "+"}
            {Math.abs(entry.value)}% {entry.key}
          </div>
        ))}
      </div>
    );
  }

  async function handleCopy(text: string, index: number) {
    await navigator.clipboard.writeText(text);

    setCopiedIndex(index);

    setTimeout(() => setCopiedIndex(null), 1500);
  }

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title: "Klynt UX Report",
        url,
      });

      return;
    }

    await navigator.clipboard.writeText(url);

    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  }

  function handleRerun() {
    router.push("/analyze");
  }

  // =========================
  // LOAD REPORT
  // =========================

  useEffect(() => {
    if (!reportId) return;

    const stored = loadReport(reportId);

    if (!stored) {
      setLoadState("missing");
      return;
    }

    try {
      const parsed = JSON.parse(stored);

      if (!isValidAuditResponse(parsed)) {
        setLoadState("missing");
        return;
      }

      setData(parsed);
      setLoadState("ready");
    } catch {
      setLoadState("missing");
    }
  }, [reportId]);

  // =========================
  // LOADING
  // =========================

  if (loadState === "loading") {
    return (
      <>
        <AppHeader />
        <main className="flex min-h-[calc(100dvh-64px)] items-center justify-center bg-[#F5F7FA] px-6 md:min-h-[calc(100dvh-72px)]">
          <div className="rounded-3xl border border-neutral-200 bg-white px-8 py-6 shadow-sm">
            <p className="text-[15px] text-[var(--ink-secondary)]">
              Loading report...
            </p>
          </div>
        </main>
      </>
    );
  }

  if (loadState === "missing" || !data) {
    return (
      <>
        <AppHeader />
        <main className="flex min-h-[calc(100dvh-64px)] items-center justify-center bg-[#F5F7FA] px-6 md:min-h-[calc(100dvh-72px)]">
          <div className="max-w-[440px] rounded-3xl border border-neutral-200 bg-white px-8 py-8 text-center shadow-sm">
            <p className="text-[20px] font-semibold tracking-[-0.02em] text-[var(--ink-primary)]">
              Report not available
            </p>
            <p className="mt-3 text-[15px] leading-7 text-[var(--ink-secondary)]">
              This report is stored only in the browser where the analysis was
              run. Open the link from the same device or run a new analysis.
            </p>
            <div className="mt-6">
              <Button href="/analyze" fullWidth={false} className="px-8">
                Run new analysis
              </Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  const riskTier = getRiskTier(data.risk ?? "");
  const riskColor = getTierColor(riskTier);

  return (
    <>
      <AppHeader />

      {/* MAIN */}
      <main
        className="
          min-h-[calc(100dvh-64px)] md:min-h-[calc(100dvh-72px)]
          bg-[#F5F7FA]
          px-4
          pb-12
          pt-4
          text-[var(--ink-primary)]
          md:px-6
          md:pt-6
        "
      >
        <div className="mx-auto max-w-[1180px]">
          {/* HERO */}
          <div
            className="
              overflow-hidden
              rounded-[28px]
              border
              border-[var(--stroke-light)]
              bg-white
              md:rounded-[36px]
            "
          >

            {/* HEADER */}
            <div
              className="
                flex
                flex-col
                gap-6
                px-5
                py-6
                md:px-10
                md:py-8
                lg:flex-row
                lg:items-start
                lg:justify-between
              "
            >
                {/* LEFT */}
                <div className="min-w-0">
                  {/* TITLE */}
                  <div className="flex flex-wrap items-center gap-3">
                    <h1
                      className="
                        text-[34px]
                        leading-none
                        font-semibold
                        tracking-[-0.05em]
                        text-[var(--ink-primary)]
                        md:text-[48px]
                      "
                    >
                      Clarity Report
                    </h1>

                    <div
                      className="
                        rounded-full
                        border
                        border-[#DCE7F8]
                        bg-[#F4F8FF]
                        px-3
                        py-1
                        text-[12px]
                        font-semibold
                        text-[#2F6FED]
                      "
                    >
                      AI Generated
                    </div>
                  </div>

                  {/* META */}
                  <div
                    className="
                      mt-4
                      flex
                      flex-wrap
                      items-center
                      gap-x-3
                      gap-y-1
                      text-[13px]
                      text-[var(--ink-secondary)]
                      md:text-[14px]
                    "
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {data.url && (
                        <img
                          src={`https://www.google.com/s2/favicons?domain_url=${data.url}&sz=32`}
                          alt=""
                          className="h-4 w-4 shrink-0 rounded-sm"
                        />
                      )}

                      <span className="truncate">{data.url}</span>
                    </div>

                    <span className="text-neutral-300">•</span>

                    <span className="shrink-0">
                      {data.generatedAt
                        ? new Date(data.generatedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )
                        : new Date().toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                    </span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex w-full gap-2 sm:w-auto">
                  <button
                    onClick={() => window.print()}
                    className="
                      flex
                      flex-1
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      border
                      border-[var(--stroke-light)]
                      bg-white
                      px-4
                      py-3
                      text-[14px]
                      font-medium
                      text-[var(--ink-primary)]
                      transition-colors
                      duration-200
                      hover:border-[rgba(20,168,232,0.25)]
                      hover:bg-[#F8FBFF]
                      md:flex-none
                      md:rounded-full
                      md:px-5
                    "
                  >
                    <RiDownload2Line size={18} />
                    <span>Export PDF</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="
                      flex
                      flex-1
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      border
                      border-[var(--stroke-light)]
                      bg-white
                      px-4
                      py-3
                      text-[14px]
                      font-medium
                      text-[var(--ink-primary)]
                      transition-colors
                      duration-200
                      hover:border-[rgba(20,168,232,0.25)]
                      hover:bg-[#F8FBFF]
                      md:flex-none
                      md:rounded-full
                      md:px-5
                    "
                  >
                    <RiShareForwardLine size={18} />

                    <span>{copied ? "Copied" : "Share"}</span>
                  </button>
                </div>
              </div>

            {/* SUMMARY */}
            <div className="border-t border-[var(--stroke-light)]">
              <div className="px-5 py-6 md:px-10 md:py-8">
                <h2 className={styles.titleSection}>Summary</h2>

                <div
                  className="
                    mt-5
                    lg:grid
                    lg:grid-cols-[1.6fr_0.7fr]
                    lg:divide-x
                    lg:divide-[var(--stroke-light)]
                  "
                >
                  {/* SCORE + VERDICT */}
                  <div className="pb-6 lg:pr-8 lg:pb-0">
                    <div
                      className="
                        flex
                        flex-col
                        gap-6
                        sm:flex-row
                        sm:items-start
                      "
                    >
                      <div className="relative mx-auto flex h-[148px] w-[148px] shrink-0 items-center justify-center sm:mx-0">
                        {(() => {
                          const score = Number(data?.score ?? 0);
                          const radius = 62;
                          const strokeWidth = 6;
                          const size = 148;
                          const center = size / 2;
                          const circumference = 2 * Math.PI * radius;
                          const progress =
                            circumference - (score / 100) * circumference;
                          const scoreColor = getScoreColor(score);

                          return (
                            <>
                              <svg
                                className="-rotate-90"
                                width={size}
                                height={size}
                                aria-hidden
                              >
                                <circle
                                  cx={center}
                                  cy={center}
                                  r={radius}
                                  stroke="#E5E7EB"
                                  strokeWidth={strokeWidth}
                                  fill="transparent"
                                />
                                <circle
                                  cx={center}
                                  cy={center}
                                  r={radius}
                                  stroke={scoreColor}
                                  strokeWidth={strokeWidth}
                                  fill="transparent"
                                  strokeLinecap="round"
                                  strokeDasharray={circumference}
                                  strokeDashoffset={progress}
                                  className="transition-all duration-700 ease-out"
                                />
                              </svg>

                              <div className="absolute text-center">
                                <p className="text-[12px] font-semibold text-[var(--ink-primary)]">
                                  UX Score
                                </p>
                                <p
                                  className="text-[52px] leading-none font-semibold md:text-[56px]"
                                  style={{ color: scoreColor }}
                                >
                                  {score}
                                </p>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className="
                            text-center
                            text-[20px]
                            leading-[1.35]
                            font-semibold
                            tracking-[-0.03em]
                            text-[var(--ink-primary)]
                            sm:text-left
                            md:text-[24px]
                          "
                        >
                          {data.verdict || "UX assessment complete"}
                        </p>

                        <p className="mt-3 text-center text-[12px] font-medium uppercase tracking-[0.08em] text-neutral-400 sm:mt-3.5 sm:text-left">
                          Top insight
                        </p>

                        <p
                          className="
                            mt-1
                            text-center
                            text-[15px]
                            leading-[1.65]
                            text-[var(--ink-secondary)]
                            sm:text-left
                            md:text-[16px]
                          "
                        >
                          {data.summary || "No summary generated."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CONVERSION HEALTH */}
                  <div className="border-t border-[var(--stroke-light)] pt-6 lg:border-t-0 lg:pl-8 lg:pt-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[14px] font-semibold text-[var(--ink-primary)]">
                        Conversion Health
                      </p>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: riskColor }}
                        />
                        <p
                          className="text-[15px] font-semibold tracking-[-0.02em]"
                          style={{ color: riskColor }}
                        >
                          {normalizeRisk(data.risk ?? "")}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {(
                        [
                          ["Clarity", data.breakdown?.clarity],
                          ["Trust", data.breakdown?.trust],
                          ["Conversion", data.breakdown?.conversion],
                        ] as const
                      ).map(([label, value]) => {
                        const score = Math.max(
                          0,
                          Math.min(100, Number(value ?? 0))
                        );
                        const barColor = getScoreColor(score);

                        return (
                          <div key={label}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[12px] text-neutral-500">
                                {label}
                              </span>
                              <span
                                className="text-[12px] font-semibold tabular-nums"
                                style={{ color: barColor }}
                              >
                                {score}
                              </span>
                            </div>
                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${score}%`,
                                  backgroundColor: barColor,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 border-t border-[var(--stroke-light)] pt-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[12px] font-medium text-neutral-500">
                          AI confidence
                        </p>
                        <p className="text-[14px] font-semibold tabular-nums text-[var(--ink-primary)]">
                          {data.confidence}%
                        </p>
                      </div>

                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className="
                            h-full
                            rounded-full
                            bg-[#061C2F]
                            transition-all
                            duration-700
                          "
                          style={{
                            width: `${Math.max(0, Math.min(100, Number(data.confidence ?? 0)))}%`,
                          }}
                        />
                      </div>

                      <p className="mt-2 text-[11px] leading-[1.45] text-neutral-500">
                        Based on visible UI structure, messaging clarity and
                        conversion signals.
                      </p>
                    </div>
                  </div>
                </div>

                {/* KEY OBSERVATION */}
                <div className="mt-6 border-t border-[var(--stroke-light)] pt-6 md:mt-8 md:pt-8">
                  <div className="flex items-start gap-3.5">
                    <RiLightbulbLine
                      size={20}
                      className="mt-0.5 shrink-0 text-amber-600"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-amber-700">
                        Key observation
                      </p>
                      <p
                        className="
                          mt-1.5
                          text-[15px]
                          leading-[1.55]
                          font-medium
                          tracking-[-0.01em]
                          text-[var(--ink-primary)]
                          md:text-[16px]
                        "
                      >
                        {data.key_observation ||
                          "No key observation available."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* LOWER CONTENT */}
          <div className="mt-8 space-y-8">
            {/* UX ISSUES */}
            <section>
              <div className="mb-5 flex items-center justify-between">
                <h3 className={styles.titleSection}>UX Issues</h3>

                <div className="rounded-full bg-white px-3 py-1 text-[13px] font-medium text-neutral-500">
                  {data.issues?.length || 0} findings
                </div>
              </div>

              <div className="space-y-4">
                {data.issues?.map((issue: any, index: number) => {
                  const impactEntries = getImpactEntries(issue);

                  return (
                    <div
                      key={index}
                      className="
                        rounded-[28px]
                        border
                        border-[var(--stroke-light)]
                        bg-white
                        px-5
                        py-6
                        transition-all
                        hover:-translate-y-[1px]
                        hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]
                        md:px-8
                      "
                    >
                      <div className="flex flex-col gap-5 md:flex-row md:gap-6">
                        {/* NUMBER */}
                        <div className="hidden md:flex items-start justify-center pt-1">
                          <span className="text-[38px] leading-none font-medium text-neutral-300">
                            {index + 1}
                          </span>
                        </div>

                        {/* CONTENT */}
                        <div className="min-w-0 flex-1">
                          <div
                            className="
                              flex flex-col gap-3
                              lg:flex-row lg:items-start lg:justify-between
                            "
                          >
                            <div className="min-w-0 flex-1">
                              <div className="mb-3 flex items-center gap-3 md:hidden">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F7FA] text-[14px] font-semibold text-neutral-500">
                                  {index + 1}
                                </div>
                              </div>

                              <p
                                className="
                                  text-[20px]
                                  font-semibold
                                  leading-[1.3]
                                  tracking-[-0.02em]
                                  text-[var(--ink-primary)]
                                  md:text-[22px]
                                "
                              >
                                {issue.title}
                              </p>

                              <div className="lg:hidden">
                                <ImpactBadges
                                  entries={impactEntries}
                                  variant="negative"
                                  className="mt-3"
                                />
                              </div>
                            </div>

                            <div className="hidden shrink-0 lg:block">
                              <ImpactBadges
                                entries={impactEntries}
                                variant="negative"
                              />
                            </div>
                          </div>

                          {/* TAGS */}
                          <div className="mt-4 flex flex-wrap gap-2">
                            {issue.bullets
                              ?.slice(0, 3)
                              .map((b: any, i: number) => (
                                <span
                                  key={i}
                                  className="
                                    rounded-full
                                    border
                                    border-neutral-200
                                    bg-neutral-50
                                    px-3
                                    py-1.5
                                    text-[12px]
                                    font-medium
                                    text-neutral-600
                                    md:text-[13px]
                                  "
                                >
                                  {b}
                                </span>
                              ))}
                          </div>

                          {/* WHY */}
                          {issue.why && (
                            <div className="mt-6 border-t border-neutral-100 pt-5">
                              <p className="text-[14px] font-semibold text-[var(--ink-primary)]">
                                Why it matters
                              </p>

                              <p className="mt-2 text-[15px] leading-7 text-[var(--ink-secondary)]">
                                {issue.why}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* IMPROVEMENTS */}
            {data?.suggestions && data.suggestions.length > 0 && (
              <section>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h3 className={`${styles.titleSection} min-w-0 shrink`}>
                    Suggested Improvements
                  </h3>

                  <div className="max-w-[46%] shrink-0 truncate rounded-full bg-white px-3 py-1 text-[13px] font-medium leading-none text-neutral-500 sm:max-w-none">
                    {data.suggestions.length} recommendations
                  </div>
                </div>

                <div className="space-y-4">
                  {data.suggestions.map((item: any, index: number) => {
                    const impactEntries = getImpactEntries(item);

                    return (
                      <div
                        key={index}
                        className="
                          rounded-[28px]
                          border
                          border-[var(--stroke-light)]
                          bg-white
                          px-5
                          py-6
                          transition-all
                          duration-200
                          hover:-translate-y-[1px]
                          hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]
                          md:px-8
                        "
                      >
                        <div className="flex flex-col gap-5 md:flex-row md:gap-6">
                          {/* NUMBER */}
                          <div className="hidden md:flex items-start justify-center pt-1">
                            <span className="text-[38px] leading-none font-medium text-neutral-300">
                              {index + 1}
                            </span>
                          </div>

                          {/* CONTENT */}
                          <div className="min-w-0 flex-1">
                            <div
                              className="
                                flex flex-col gap-3
                                lg:flex-row lg:items-start lg:justify-between
                              "
                            >
                              <div className="min-w-0 flex-1">
                                <div className="mb-3 flex items-center gap-3 md:hidden">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F7FA] text-[14px] font-semibold text-neutral-500">
                                    {index + 1}
                                  </div>
                                </div>

                                <p
                                  className="
                                    text-[20px]
                                    leading-[1.3]
                                    font-semibold
                                    tracking-[-0.02em]
                                    text-[var(--ink-primary)]
                                    md:text-[22px]
                                  "
                                >
                                  {item.section}
                                </p>

                                <div className="lg:hidden">
                                  <ImpactBadges
                                    entries={impactEntries}
                                    variant="positive"
                                    className="mt-3"
                                  />
                                </div>
                              </div>

                              <div className="hidden shrink-0 lg:block">
                                <ImpactBadges
                                  entries={impactEntries}
                                  variant="positive"
                                />
                              </div>
                            </div>

                            <p
                              className="
                                mt-3
                                text-[16px]
                                leading-7
                                text-[var(--ink-primary)]
                                md:text-[18px]
                              "
                            >
                              {item.recommendation}
                            </p>

                            {/* WHY */}
                            {item.why && (
                              <div className="mt-6 border-t border-neutral-100 pt-5">
                                <p className="text-[14px] font-semibold text-[var(--ink-primary)]">
                                  Why it works
                                </p>

                                <p className="mt-2 text-[15px] leading-7 text-[var(--ink-secondary)]">
                                  {item.why}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* COPY REFINEMENT */}
            {data?.copy && data.copy.length > 0 && (
              <section>
                <div className="mb-5 flex items-center justify-between">
                  <h3 className={styles.titleSection}>Copy Refinement</h3>

                  <div className="rounded-full bg-white px-3 py-1 text-[13px] font-medium text-neutral-500">
                    AI rewrites
                  </div>
                </div>

                <div className="space-y-4">
                  {data.copy.map((item: any, index: number) => {
                    const impactEntries = getImpactEntries(item);

                    return (
                      <div
                        key={index}
                        className="
                          rounded-[28px]
                          border
                          border-[var(--stroke-light)]
                          bg-white
                          px-5
                          py-6
                          transition-all
                          duration-200
                          hover:-translate-y-[1px]
                          hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]
                          md:px-8
                        "
                      >
                        <div className="flex flex-col gap-5 md:flex-row md:gap-6">
                          {/* NUMBER */}
                          <div className="hidden md:flex items-start justify-center pt-1">
                            <span className="text-[38px] leading-none font-medium text-neutral-300">
                              {index + 1}
                            </span>
                          </div>

                          {/* CONTENT */}
                          <div className="min-w-0 flex-1">
                            <div
                              className="
                                flex flex-col gap-3
                                lg:flex-row lg:items-start lg:justify-between
                              "
                            >
                              <div className="min-w-0 flex-1">
                                <p
                                  className="
                                    text-[20px]
                                    leading-[1.3]
                                    font-semibold
                                    tracking-[-0.02em]
                                    text-[var(--ink-primary)]
                                    md:text-[22px]
                                  "
                                >
                                  {item.section}
                                </p>

                                <div className="lg:hidden">
                                  <ImpactBadges
                                    entries={impactEntries}
                                    variant="sky"
                                    className="mt-3"
                                  />
                                </div>
                              </div>

                              <div className="hidden shrink-0 lg:block">
                                <ImpactBadges
                                  entries={impactEntries}
                                  variant="sky"
                                />
                              </div>
                            </div>

                            {/* BEFORE AFTER */}
                            <div className="mt-6 grid gap-4 lg:grid-cols-2">
                              {/* BEFORE */}
                              <div
                                className="
                                  rounded-2xl
                                  border
                                  border-neutral-200
                                  bg-neutral-50
                                  p-5
                                "
                              >
                                <div className="mb-3 flex items-center justify-between">
                                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
                                    Before
                                  </p>

                                  <div
                                    className="
                                      rounded-full
                                      border
                                      border-neutral-200
                                      bg-white
                                      px-2.5
                                      py-1
                                      text-[11px]
                                      font-medium
                                      text-neutral-500
                                    "
                                  >
                                    Original
                                  </div>
                                </div>

                                <p className="text-[15px] leading-7 text-neutral-600">
                                  {item.before}
                                </p>
                              </div>

                              {/* AFTER */}
                              <div
                                className="
                                  relative
                                  rounded-2xl
                                  border
                                  border-sky-200
                                  bg-sky-50/70
                                  p-5
                                "
                              >
                                <div className="mb-3 flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                    <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-sky-700">
                                      Improved
                                    </p>

                                    <div
                                      className="
                                        rounded-full
                                        border
                                        border-sky-200
                                        bg-white
                                        px-2.5
                                        py-1
                                        text-[11px]
                                        font-medium
                                        text-sky-700
                                      "
                                    >
                                      AI Suggestion
                                    </div>
                                  </div>

                                  {/* COPY */}
                                  <div className="relative">
                                    <button
                                      onClick={() =>
                                        handleCopy(item.after, index)
                                      }
                                      className="
                                        flex
                                        h-9
                                        w-9
                                        items-center
                                        justify-center
                                        rounded-xl
                                        border
                                        border-sky-200
                                        bg-white
                                        text-sky-700
                                        transition
                                        hover:bg-sky-100
                                      "
                                    >
                                      {copiedIndex === index ? (
                                        <RiCheckLine size={18} />
                                      ) : (
                                        <RiFileCopyLine size={18} />
                                      )}
                                    </button>

                                    {copiedIndex === index && (
                                      <div
                                        className="
                                          absolute
                                          -top-8
                                          left-1/2
                                          -translate-x-1/2
                                          whitespace-nowrap
                                          rounded-full
                                          border
                                          border-sky-200
                                          bg-white
                                          px-3
                                          py-1
                                          text-[11px]
                                          font-medium
                                          text-sky-700
                                          shadow-sm
                                        "
                                      >
                                        Copied
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <p className="text-[16px] font-medium leading-7 text-[var(--ink-primary)] md:text-[17px]">
                                  {item.after}
                                </p>
                              </div>
                            </div>

                            {/* WHY */}
                            {item.why && (
                              <div className="mt-6 border-t border-neutral-100 pt-5">
                                <p className="text-[14px] font-semibold text-[var(--ink-primary)]">
                                  Why it works
                                </p>

                                <p className="mt-2 text-[15px] leading-7 text-[var(--ink-secondary)]">
                                  {item.why}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* CTA */}
            <section
              className="
                overflow-hidden
                rounded-[32px]
                border
                border-[rgba(6,28,47,0.05)]
                bg-white
                px-6
                py-8
                text-center
                shadow-[0_10px_40px_rgba(0,0,0,0.03)]
                md:px-10
              "
            >
              <div className="mx-auto max-w-[760px]">
                <div
                  className="
                    mx-auto
                    inline-flex
                    items-center
                    rounded-full
                    border
                    border-[#DCE7F8]
                    bg-[#F4F8FF]
                    px-3
                    py-1
                    text-[12px]
                    font-semibold
                    text-[#2F6FED]
                  "
                >
                  Next Step
                </div>

                <h3
                  className="
                    mt-4
                    text-[30px]
                    leading-[1.05]
                    font-semibold
                    tracking-[-0.04em]
                    text-[var(--ink-primary)]
                    md:text-[42px]
                  "
                >
                  Improve your UX and run another analysis
                </h3>

                <p
                  className="
                    mt-4
                    text-[16px]
                    leading-7
                    text-[var(--ink-secondary)]
                  "
                >
                  Iterate on messaging, trust, hierarchy and conversion flow —
                  then compare updated UX scores.
                </p>

                {/* BUTTONS */}
                <div
                  className="
                    mt-8
                    flex
                    flex-col
                    items-center
                    justify-center
                    gap-3
                    sm:flex-row
                  "
                >
                  <Button
                    onClick={handleRerun}
                    icon={<RiArrowRightUpLine size={18} />}
                    fullWidth={false}
                    className="w-full sm:w-auto"
                  >
                    Re-run analysis
                  </Button>

                  <Button
                    onClick={() => window.print()}
                    variant="secondary"
                    icon={<RiDownload2Line size={18} />}
                    fullWidth={false}
                    className="w-full sm:w-auto"
                  >
                    Export PDF
                  </Button>
                </div>

                {/* BOTTOM META */}
                <div
                  className="
                    mt-6
                    flex
                    flex-wrap
                    items-center
                    justify-center
                    gap-3
                    text-[13px]
                    text-neutral-500
                  "
                >
                  <div className="rounded-full bg-[#F5F7FA] px-3 py-1">
                    AI-generated insights
                  </div>

                  <div className="rounded-full bg-[#F5F7FA] px-3 py-1">
                    Shareable report
                  </div>

                  <div className="rounded-full bg-[#F5F7FA] px-3 py-1">
                    PDF export
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}