"use client";

import { useId, useState } from "react";
import { RiArrowDownSLine } from "@remixicon/react";

import {
  AUDIENCE_TYPE_OPTIONS,
  TRAFFIC_SOURCE_OPTIONS,
  type AudienceType,
  type TrafficSource,
} from "@/lib/audit-context";
import {
  BRAND_STAGE_OPTIONS,
  getBrandStageLabel,
  type BrandStage,
} from "@/lib/brand-stage";

type AnalyzeContextCollapsibleProps = {
  brandStage: BrandStage;
  trafficSource: TrafficSource;
  audienceType: AudienceType;
  onBrandStageChange: (value: BrandStage) => void;
  onTrafficSourceChange: (value: TrafficSource) => void;
  onAudienceTypeChange: (value: AudienceType) => void;
  disabled?: boolean;
};

function getTrafficPillLabel(source: TrafficSource) {
  if (source === "cold") return "Cold traffic";
  if (source === "warm") return "Warm traffic";
  return "Mixed";
}

function ContextPills<T extends string>({
  options,
  value,
  onChange,
  disabled,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const isActive = value === option.id;

        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.id)}
            className={[
              "rounded-full border-[0.5px] px-[13px] py-[5px] text-[12px] font-medium transition-all",
              isActive
                ? "border-[rgba(29,158,117,0.3)] bg-[#E1F5EE] text-[#0F6E56]"
                : "border-transparent bg-[#E8E8E6] text-[#555] hover:bg-[#E5E5E3] hover:text-[#111]",
              disabled ? "cursor-not-allowed opacity-60" : "",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function AnalyzeContextCollapsible({
  brandStage,
  trafficSource,
  audienceType,
  onBrandStageChange,
  onTrafficSourceChange,
  onAudienceTypeChange,
  disabled = false,
}: AnalyzeContextCollapsibleProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const defaultPills = [
    getBrandStageLabel(brandStage),
    getTrafficPillLabel(trafficSource),
    AUDIENCE_TYPE_OPTIONS.find((option) => option.id === audienceType)?.label ??
      audienceType,
  ];

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className={[
          "mt-[18px] flex w-full items-center justify-between border-t border-black/[0.08] px-[18px] py-4 text-left transition-colors",
          disabled ? "cursor-not-allowed opacity-60" : "hover:[&_.context-label]:text-[#111]",
        ].join(" ")}
      >
        <span className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="context-label text-[13px] text-[#999] transition-colors">
            Page context
          </span>
          {!open ? (
            <span className="flex flex-wrap gap-1.5">
              {defaultPills.map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-[#E8E8E6] px-[9px] py-[3px] text-[11px] text-[#555]"
                >
                  {label}
                </span>
              ))}
            </span>
          ) : null}
        </span>
        <RiArrowDownSLine
          size={16}
          className={[
            "shrink-0 text-[#bbb] transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden
        />
      </button>

      <div
        id={panelId}
        className={[
          "overflow-hidden transition-[max-height,padding] duration-250 ease-out",
          open ? "max-h-[320px] px-[18px] pb-[18px]" : "max-h-0",
        ].join(" ")}
      >
        <div className="space-y-3.5">
          <div>
            <p className="mb-2 text-[12px] text-[#999]">How established is your brand?</p>
            <ContextPills
              options={BRAND_STAGE_OPTIONS.map((option) => ({
                id: option.id,
                label: option.label,
              }))}
              value={brandStage}
              onChange={onBrandStageChange}
              disabled={disabled}
            />
          </div>

          <div>
            <p className="mb-2 text-[12px] text-[#999]">Who visits this page?</p>
            <ContextPills
              options={TRAFFIC_SOURCE_OPTIONS.map((option) => ({
                id: option.id,
                label: getTrafficPillLabel(option.id),
              }))}
              value={trafficSource}
              onChange={onTrafficSourceChange}
              disabled={disabled}
            />
          </div>

          <div>
            <p className="mb-2 text-[12px] text-[#999]">Who is your audience?</p>
            <ContextPills
              options={AUDIENCE_TYPE_OPTIONS.map((option) => ({
                id: option.id,
                label: option.label,
              }))}
              value={audienceType}
              onChange={onAudienceTypeChange}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </>
  );
}
