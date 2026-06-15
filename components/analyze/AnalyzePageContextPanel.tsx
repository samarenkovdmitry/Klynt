"use client";

import { useState } from "react";
import { RiArrowDownSLine, RiArrowUpSLine } from "@remixicon/react";

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
    <span className="rounded-full border border-[rgba(6,28,47,0.15)] px-2.5 py-1 text-[12px] leading-none text-[var(--ink-primary)]">
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
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.id)}
            className={[
              "rounded-full px-3 py-1.5 text-[13px] transition",
              value === option.id
                ? "border border-[rgba(6,28,47,0.15)] bg-white font-medium text-[var(--ink-primary)]"
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
    <div className="mt-4 border-t border-[rgba(6,28,47,0.06)] pt-4">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className={[
          "flex w-full items-center gap-2",
          disabled ? "cursor-not-allowed opacity-60" : "",
        ].join(" ")}
      >
        <span className="flex shrink-0 items-center gap-1.5 text-[13px] text-[#8E99A2]">
          Page context
          <span
            className="flex h-[15px] w-[15px] items-center justify-center rounded-full border border-[rgba(6,28,47,0.25)] text-[9px] font-semibold leading-none text-[#8E99A2]"
            aria-hidden
          >
            ?
          </span>
        </span>

        {!expanded ? (
          <>
            {/* Desktop: all 3 selected value pills */}
            <span className="hidden flex-1 items-center justify-end gap-1.5 sm:flex">
              <CollapsedPill>{brandLabel}</CollapsedPill>
              <CollapsedPill>{trafficLabel}</CollapsedPill>
              <CollapsedPill>{audienceLabel}</CollapsedPill>
            </span>
            {/* Mobile: first pill + remaining count */}
            <span className="flex flex-1 items-center justify-end gap-1.5 sm:hidden">
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

      {expanded && (
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
      )}
    </div>
  );
}
