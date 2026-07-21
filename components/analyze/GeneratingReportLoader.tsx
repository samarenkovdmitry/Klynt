"use client";

import { useEffect, useState } from "react";
import { RiLink } from "@remixicon/react";

import { BRAND_STAGE_OPTIONS, type BrandStage } from "@/lib/brand-stage";
import { ANALYZE_CARD_CLASS } from "@/lib/analyze-page-styles";
import type { AudienceType, TrafficSource } from "@/lib/audit-context";

const STEPS = [
  "Capturing page structure...",
  "Analysing visual hierarchy...",
  "Reviewing conversion flow...",
  "Evaluating trust signals...",
  "Generating recommendations...",
] as const;

const STEP_DURATION_MS = 2200;
const FADE_MS = 250;

const TRAFFIC_LABELS: Record<TrafficSource, string> = {
  cold: "Cold traffic",
  warm: "Warm traffic",
  mixed: "Mixed",
};

const AUDIENCE_LABELS: Record<AudienceType, string> = {
  b2b: "B2B",
  b2c: "B2C",
  both: "B2B/B2C",
};

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

type Props = {
  url: string;
  inputMode: "url" | "screenshot";
  imageName?: string;
  brandStage: BrandStage;
  trafficSource: TrafficSource;
  audienceType: AudienceType;
};

export function GeneratingReportLoader({
  url,
  inputMode,
  imageName,
  brandStage,
  trafficSource,
  audienceType,
}: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepVisible, setStepVisible] = useState(true);

  useEffect(() => {
    if (currentStep >= STEPS.length - 1) return;

    let innerTimer: ReturnType<typeof setTimeout>;
    const outerTimer = setTimeout(() => {
      setStepVisible(false);
      innerTimer = setTimeout(() => {
        setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
        setStepVisible(true);
      }, FADE_MS);
    }, STEP_DURATION_MS);

    return () => {
      clearTimeout(outerTimer);
      clearTimeout(innerTimer);
    };
  }, [currentStep]);

  const displayLabel =
    inputMode === "url" ? stripProtocol(url) : (imageName ?? "Screenshot");

  const brandLabel =
    BRAND_STAGE_OPTIONS.find((o) => o.id === brandStage)?.label ?? brandStage;
  const pills = [brandLabel, TRAFFIC_LABELS[trafficSource], AUDIENCE_LABELS[audienceType]];

  return (
    <div className={`${ANALYZE_CARD_CLASS} mx-auto mt-5 w-full max-w-[500px] px-10 py-8`}>
      {/* URL row */}
      <div className="flex items-center gap-2.5">
        <RiLink size={16} className="shrink-0 text-[#8E99A2]" aria-hidden />
        <span className="truncate text-[14px] font-medium text-[var(--ink-primary)]">
          {displayLabel}
        </span>
      </div>

      {/* Title + step counter */}
      <div className="mt-5 flex items-center justify-between gap-4">
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--ink-primary)]">
          Generating UX report
        </span>
        <span className="shrink-0 text-[13px] tabular-nums text-[#8E99A2]">
          Step {currentStep + 1} of {STEPS.length}
        </span>
      </div>

      {/* Segments */}
      <div className="mt-3 flex gap-[6px]" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemax={STEPS.length}>
        {STEPS.map((_, i) => {
          const isDone = i < currentStep;
          const isActive = i === currentStep;
          return (
            <div
              key={i}
              className={[
                "h-[3px] flex-1 rounded-[2px] transition-colors duration-300",
                isDone
                  ? "bg-[var(--ink-primary)]"
                  : isActive
                    ? "animate-pulse-segment bg-[var(--ink-secondary)]"
                    : "bg-[rgba(6,28,47,0.10)]",
              ].join(" ")}
            />
          );
        })}
      </div>

      {/* Step label */}
      <p
        className="mt-2.5 text-[13px] text-[#8E99A2]"
        style={{ opacity: stepVisible ? 1 : 0, transition: `opacity ${FADE_MS}ms ease` }}
      >
        {STEPS[currentStep]}
      </p>

      {/* Context pills */}
      <div className="mt-5 flex flex-wrap gap-2">
        {pills.map((pill) => (
          <span
            key={pill}
            className="inline-flex h-[24px] items-center rounded-full border border-[rgba(6,28,47,0.10)] bg-white px-2.5 text-[13px] leading-none text-[#8E99A2]"
          >
            {pill}
          </span>
        ))}
      </div>
    </div>
  );
}
