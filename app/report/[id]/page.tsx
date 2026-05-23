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
  const stored = localStorage.getItem(`report-${reportId}`);

  if (!stored) {
    router.push("/analyze");
    return;
  }

  try {
    setData(JSON.parse(stored));
  } catch {
    router.push("/analyze");
  }
}, [params.id, router]);

  // =========================
  // LOADING
  // =========================

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F7FA] px-6">
        <div className="rounded-3xl border border-neutral-200 bg-white px-8 py-6 shadow-sm">
          <p className="text-[15px] text-[var(--ink-secondary)]">
            Loading report...
          </p>
        </div>
      </main>
    );
  }

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
              relative
              overflow-hidden
              rounded-[28px]
              border
              border-[rgba(6,28,47,0.05)]
              bg-white
              px-5
              py-6
              shadow-[0_10px_40px_rgba(0,0,0,0.03)]
              md:rounded-[36px]
              md:px-10
              md:py-8
            "
          >
            {/* TOP LIGHT */}
            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-[radial-gradient(circle_at_top,#F7FBFF_0%,transparent_72%)]
              "
            />

            <div className="relative z-10">
              {/* HEADER */}
              <div
                className="
                  flex
                  flex-col
                  gap-6
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
                      gap-y-2
                      text-[13px]
                      text-[var(--ink-secondary)]
                      md:text-[14px]
                    "
                  >
                    {/* DOMAIN */}
                    <div className="flex min-w-0 items-center gap-2">
                      {data.url && (
                        <img
                          src={`https://www.google.com/s2/favicons?domain_url=${data.url}&sz=32`}
                          alt="favicon"
                          className="h-4 w-4 rounded-sm"
                        />
                      )}

                      <span className="truncate">{data.url}</span>
                    </div>

                    <span className="hidden text-neutral-300 md:block">
                      •
                    </span>

                    <span>AI UX analysis</span>

                    <span className="hidden text-neutral-300 md:block">
                      •
                    </span>

                    <span>
                      Generated{" "}
                      {new Date().toLocaleDateString("en-US", {
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
                      border-[rgba(6,28,47,0.08)]
                      bg-white
                      px-4
                      py-3
                      text-[14px]
                      font-medium
                      text-[var(--ink-primary)]
                      transition-all
                      duration-200
                      hover:border-[rgba(20,168,232,0.18)]
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
                      border-[rgba(6,28,47,0.08)]
                      bg-white
                      px-4
                      py-3
                      text-[14px]
                      font-medium
                      text-[var(--ink-primary)]
                      transition-all
                      duration-200
                      hover:border-[rgba(20,168,232,0.18)]
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
              <div className="mt-8">
                <h2 className={styles.titleSection}>Summary</h2>

                <div
                  className="
                    mt-5
                    grid
                    items-stretch
                    gap-4
                    lg:grid-cols-[1.6fr_0.7fr]
                  "
                >
                  {/* SCORE CARD */}
                  <div
                    className="
                      flex
                      h-full
                      flex-col
                      rounded-[28px]
                      border
                      border-neutral-200
                      bg-white
                      px-5
                      py-5
                      md:px-6
                      md:py-5
                    "
                  >
                    {/* Score + verdict + top insight */}
                    <div
                      className="
                        flex
                        flex-col
                        gap-4
                        sm:flex-row
                        sm:items-start
                        sm:gap-5
                      "
                    >
                      <div className="relative mx-auto flex h-[108px] w-[108px] shrink-0 items-center justify-center sm:mx-0">
                        {(() => {
                          const score = Number(data?.score ?? 0);
                          const size = 108;
                          const center = size / 2;
                          const radius = 44;
                          const circumference = 2 * Math.PI * radius;
                          const progress =
                            circumference - (score / 100) * circumference;

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
                                  strokeWidth="6"
                                  fill="transparent"
                                />
                                <circle
                                  cx={center}
                                  cy={center}
                                  r={radius}
                                  stroke="#FF7A00"
                                  strokeWidth="6"
                                  fill="transparent"
                                  strokeLinecap="round"
                                  strokeDasharray={circumference}
                                  strokeDashoffset={progress}
                                  className="transition-all duration-700 ease-out"
                                />
                              </svg>

                              <div className="absolute text-center">
                                <p className="text-[11px] font-medium text-neutral-500">
                                  UX Score
                                </p>
                                <p className="mt-0.5 text-[32px] leading-none font-semibold text-[#FF7A00]">
                                  {score}
                                </p>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      <div className="min-w-0 flex-1 sm:pt-0.5">
                        <p
                          className="
                            text-center
                            text-[17px]
                            leading-[1.4]
                            font-semibold
                            tracking-[-0.02em]
                            text-[var(--ink-primary)]
                            sm:text-left
                            md:text-[18px]
                          "
                        >
                          {data.verdict || "UX assessment complete"}
                        </p>

                        <p className="mt-3 text-center text-[11px] font-medium uppercase tracking-[0.07em] text-neutral-400 sm:mt-3 sm:text-left">
                          Top insight
                        </p>

                        <p
                          className="
                            mt-1
                            text-center
                            text-[14px]
                            leading-[1.6]
                            font-normal
                            text-[var(--ink-secondary)]
                            sm:text-left
                          "
                        >
                          {data.summary || "No summary generated."}
                        </p>
                      </div>
                    </div>

                    {/* Key observation — grows to match health card height */}
                    <div className="mt-5 flex min-h-0 flex-1 flex-col">
                      <div
                        className="
                          flex
                          h-full
                          flex-1
                          flex-col
                          justify-start
                          rounded-[18px]
                          border
                          border-amber-100
                          bg-amber-50/60
                          px-4
                          py-3.5
                        "
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="
                              flex
                              h-8
                              w-8
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              border
                              border-amber-100
                              bg-white/90
                            "
                          >
                            <RiLightbulbLine
                              size={15}
                              className="text-amber-600/90"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-medium uppercase tracking-[0.07em] text-amber-700/90">
                              Key observation
                            </p>
                            <p
                              className="
                                mt-1
                                text-[14px]
                                leading-[1.55]
                                font-normal
                                text-[var(--ink-primary)]
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

                  {/* HEALTH CARD */}
                  <div
                    className="
                      flex
                      h-full
                      flex-col
                      rounded-[28px]
                      border
                      border-neutral-200
                      bg-white
                      px-5
                      py-5
                      md:px-6
                      md:py-5
                    "
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[14px] font-semibold text-[var(--ink-primary)]">
                        Conversion Health
                      </p>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-[#FF5A4F]" />
                        <p className="text-[15px] font-semibold tracking-[-0.02em] text-[#FF5A4F]">
                          {normalizeRisk(data.risk ?? "")}
                        </p>
                      </div>
                    </div>

                    {/* QUICK STATS */}
                    <div className="mt-4 flex min-h-0 flex-1 flex-col justify-center space-y-2.5">
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

                        return (
                          <div key={label}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[12px] text-neutral-500">
                                {label}
                              </span>
                              <span className="text-[12px] font-semibold tabular-nums text-[var(--ink-primary)]">
                                {score}
                              </span>
                            </div>
                            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                              <div
                                className="h-full rounded-full bg-[#FF7A00] transition-all duration-700"
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* CONFIDENCE */}
                    <div className="mt-auto border-t border-neutral-100 pt-4">
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
                    </div>
                  </div>
                </div>

                {/* QUICK INFO */}
                <div
                  className="
                    mt-5
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
                    Conversion analysis
                  </div>

                  <div className="rounded-full bg-[#F5F7FA] px-3 py-1">
                    UX clarity scoring
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
                  const impactEntries = [
                    {
                      key: issue.impact_metric_1,
                      value: issue.impact_value_1,
                    },
                    {
                      key: issue.impact_metric_2,
                      value: issue.impact_value_2,
                    },
                  ]
                    .filter(
                      (e) =>
                        e.key &&
                        typeof e.value === "number" &&
                        e.value !== 0
                    )
                    .slice(0, 2);

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
                        <div className="flex-1">
                          {/* TOP */}
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex-1">
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
                            </div>

                            {/* BADGES */}
                            <div className="flex flex-wrap gap-2">
                              {impactEntries.map((entry, i) => (
                                <div
                                  key={i}
                                  className="
                                    rounded-full
                                    border
                                    border-red-200
                                    bg-red-50
                                    px-3.5
                                    py-2
                                    text-[12px]
                                    font-semibold
                                    text-red-500
                                    md:text-[13px]
                                  "
                                >
                                  {entry.value}% {entry.key}
                                </div>
                              ))}
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
                <div className="mb-5 flex items-center justify-between">
                  <h3 className={styles.titleSection}>
                    Suggested Improvements
                  </h3>

                  <div className="rounded-full bg-white px-3 py-1 text-[13px] font-medium text-neutral-500">
                    {data.suggestions.length} recommendations
                  </div>
                </div>

                <div className="space-y-4">
                  {data.suggestions.map((item: any, index: number) => {
                    const impactEntries = [
                      {
                        key: item.impact_metric_1,
                        value: item.impact_value_1,
                      },
                      {
                        key: item.impact_metric_2,
                        value: item.impact_value_2,
                      },
                    ]
                      .filter(
                        (e) =>
                          e.key &&
                          typeof e.value === "number" &&
                          e.value !== 0
                      )
                      .slice(0, 2);

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
                          <div className="flex-1">
                            {/* TOP */}
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="flex-1">
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
                              </div>

                              {/* BADGES */}
                              <div className="flex flex-wrap gap-2">
                                {impactEntries.map((entry, i) => (
                                  <div
                                    key={i}
                                    className="
                                      rounded-full
                                      border
                                      border-emerald-200
                                      bg-emerald-50
                                      px-3.5
                                      py-2
                                      text-[12px]
                                      font-semibold
                                      text-emerald-600
                                      md:text-[13px]
                                    "
                                  >
                                    +{Math.abs(entry.value)}% {entry.key}
                                  </div>
                                ))}
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
                    const impactEntries = [
                      {
                        key: item.impact_metric_1,
                        value: item.impact_value_1,
                      },
                      {
                        key: item.impact_metric_2,
                        value: item.impact_value_2,
                      },
                    ]
                      .filter(
                        (e) =>
                          e.key &&
                          typeof e.value === "number" &&
                          e.value !== 0
                      )
                      .slice(0, 2);

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
                          <div className="flex-1">
                            {/* TOP */}
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="flex-1">
                                <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-neutral-400">
                                  {item.section}
                                </p>

                                <p
                                  className="
                                    mt-2
                                    text-[20px]
                                    leading-[1.3]
                                    font-semibold
                                    tracking-[-0.02em]
                                    text-[var(--ink-primary)]
                                    md:text-[22px]
                                  "
                                >
                                  Improve copy clarity and conversion intent
                                </p>
                              </div>

                              {/* BADGES */}
                              <div className="flex flex-wrap gap-2">
                                {impactEntries.map((entry, i) => (
                                  <div
                                    key={i}
                                    className="
                                      rounded-full
                                      border
                                      border-sky-200
                                      bg-sky-50
                                      px-3.5
                                      py-2
                                      text-[12px]
                                      font-semibold
                                      text-sky-700
                                      md:text-[13px]
                                    "
                                  >
                                    +{Math.abs(entry.value)}% {entry.key}
                                  </div>
                                ))}
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
                  <button
                    onClick={handleRerun}
                    className="
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      bg-[#061C2F]
                      px-6
                      py-4
                      text-[15px]
                      font-semibold
                      text-white
                      transition
                      hover:opacity-90
                      sm:w-auto
                    "
                  >
                    Re-run analysis

                    <RiArrowRightUpLine size={18} />
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      border
                      border-[rgba(6,28,47,0.08)]
                      bg-white
                      px-6
                      py-4
                      text-[15px]
                      font-semibold
                      text-[var(--ink-primary)]
                      transition
                      hover:bg-[#F8FBFF]
                      sm:w-auto
                    "
                  >
                    <RiDownload2Line size={18} />

                    Export PDF
                  </button>
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