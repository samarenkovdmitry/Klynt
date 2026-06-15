"use client";

import { useState } from "react";
import { RiArrowDownSLine, RiArrowUpSLine, RiQuestionLine } from "@remixicon/react";

import { BRAND_STAGE_OPTIONS, type BrandStage } from "@/lib/brand-stage";
import {
  AUDIENCE_TYPE_OPTIONS,
  TRAFFIC_SOURCE_OPTIONS,
  type AudienceType,
  type TrafficSource,
} from "@/lib/audit-context";

const TRAFFIC_PILL_LABELS: Record<TrafficSource, string> = {
  cold: "Cold traffic",
  warm: "Warm traffic",
  mixed: "Mixed",
};

const AUDIENCE_COLLAPSED_LABELS: Record<AudienceType, string> = {
  b2b: "B2B",
  b2c: "B2C",
  both: "B2B/B2C",
};

function CollapsedPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-[24px] items-center rounded-full border border-[#D6DDE4] bg-white px-2.5 text-[13px] leading-none text-[#8E99A2]">
      {children}
    </span>
  );
}

function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <p className="mb-2.5 text-[13px] text-[#8E99A2]">{label}</p>
      <div className="flex flex-wrap gap-1">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.id)}
            className={[
              "inline-flex h-[28px] items-center rounded-full px-3 text-[13px] transition",
              value === option.id
                ? "border border-[rgba(6,28,47,0.15)] bg-white text-[var(--ink-primary)]"
                : "bg-[#ECF0F6] text-[#8E99A2] hover:text-[var(--ink-primary)]",
              disabled ? "cursor-not-allowed opacity-60" : "",
            ].join(" ")}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

type Props = {
  brandStage: BrandStage;
  trafficSource: TrafficSource;
  audienceType: AudienceType;
  onBrandStageChange: (v: BrandStage) => void;
  onTrafficSourceChange: (v: TrafficSource) => void;
  onAudienceTypeChange: (v: AudienceType) => void;
  disabled?: boolean;
};

export function AnalyzePageContextPanel({
  brandStage,
  trafficSource,
  audienceType,
  onBrandStageChange,
  onTrafficSourceChange,
  onAudienceTypeChange,
  disabled = false,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const brandLabel =
    BRAND_STAGE_OPTIONS.find((o) => o.id === brandStage)?.label ?? brandStage;
  const trafficLabel = TRAFFIC_PILL_LABELS[trafficSource];
  const audienceLabel = AUDIENCE_COLLAPSED_LABELS[audienceType];

  return (
    <div className="mt-4">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={[
          "flex w-full items-center gap-1",
          disabled ? "cursor-not-allowed opacity-60" : "",
        ].join(" ")}
      >
        <span className="flex shrink-0 items-center gap-1.5 text-[13px] text-[#8E99A2]">
          Page context
          <RiQuestionLine
            size={16}
            className="translate-y-[2px] text-[#8E99A2]/50 transition-colors hover:text-[#8E99A2]"
            aria-hidden
          />
        </span>

        {!expanded ? (
          <>
            {/* Desktop: all 3 selected value pills */}
            <span className="hidden flex-1 items-center justify-end gap-1 sm:flex">
              <CollapsedPill>{brandLabel}</CollapsedPill>
              <CollapsedPill>{trafficLabel}</CollapsedPill>
              <CollapsedPill>{audienceLabel}</CollapsedPill>
            </span>
            {/* Mobile: first pill + remaining count */}
            <span className="flex flex-1 items-center justify-end gap-1 sm:hidden">
              <CollapsedPill>{brandLabel}</CollapsedPill>
              <CollapsedPill>+2</CollapsedPill>
            </span>
          </>
        ) : (
          <span className="flex-1" />
        )}

        {expanded ? (
          <RiArrowUpSLine size={18} className="shrink-0 text-[#8E99A2]" aria-hidden />
        ) : (
          <RiArrowDownSLine size={18} className="shrink-0 text-[#8E99A2]" aria-hidden />
        )}
      </button>

      <div
        className={[
          "grid overflow-hidden transition-all duration-200 ease-out",
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="min-h-0">
          <div className="mt-4 flex flex-col gap-4">
            <FilterGroup
              label="How established is your brand?"
              options={BRAND_STAGE_OPTIONS.map((o) => ({ id: o.id, label: o.label }))}
              value={brandStage}
              onChange={onBrandStageChange}
              disabled={disabled}
            />
            <FilterGroup
              label="Who visits this page?"
              options={TRAFFIC_SOURCE_OPTIONS.map((o) => ({
                id: o.id,
                label: TRAFFIC_PILL_LABELS[o.id],
              }))}
              value={trafficSource}
              onChange={onTrafficSourceChange}
              disabled={disabled}
            />
            <FilterGroup
              label="Who is your audience?"
              options={AUDIENCE_TYPE_OPTIONS.map((o) => ({ id: o.id, label: o.label }))}
              value={audienceType}
              onChange={onAudienceTypeChange}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
