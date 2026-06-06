import { RiCheckLine, RiFileCopyLine, RiLock2Line } from "@remixicon/react";

import type { HeadlineDirections } from "@/lib/audit-report";
import { getBrandStageLabel, type BrandStage } from "@/lib/brand-stage";
import { ReportVariantCard } from "@/components/report/ReportVariantCard";
import {
  IMPROVED_COPY_BUTTON_CLASS,
  IMPROVED_COPY_LABEL_CLASS,
  IMPROVED_COPY_PANEL_CLASS,
  IMPROVED_COPY_TOAST_CLASS,
} from "@/lib/report-priority";
import {
  REPORT_CARD_TITLE_CLASS,
  REPORT_WHY_BODY_CLASS,
  REPORT_WHY_BODY_MEASURE_CLASS,
} from "@/components/report/reportStyles";

const COPY_FIELD_HEADER_BAND_CLASS = "mb-3 flex min-h-9 items-center";
const COPY_FIELD_LABEL_CLASS =
  "text-[12px] font-semibold uppercase tracking-[0.08em]";

type ReportHeadlineDirectionsCardProps = {
  directions: HeadlineDirections;
  brandStage?: BrandStage;
  copiedIndex: number | null;
  copyIndexOffset: number;
  onCopy: (text: string, index: number) => void;
  copyLocked?: boolean;
};

export function ReportHeadlineDirectionsCard({
  directions,
  brandStage,
  copiedIndex,
  copyIndexOffset,
  onCopy,
  copyLocked = false,
}: ReportHeadlineDirectionsCardProps) {
  const before = directions.before?.trim();

  return (
    <ReportVariantCard variant="copy">
      <div className="min-w-0">
        <p className={REPORT_CARD_TITLE_CLASS}>Hero headline directions</p>

        {brandStage ? (
          <p className="mt-2 text-[13px] font-medium text-[#2563EB]">
            Tailored for {getBrandStageLabel(brandStage)} brands
          </p>
        ) : null}

        {directions.context ? (
          <p
            className={[
              REPORT_WHY_BODY_CLASS,
              REPORT_WHY_BODY_MEASURE_CLASS,
              "mt-2 mb-4",
            ].join(" ")}
          >
            {directions.context}
          </p>
        ) : (
          <div className="mb-4" />
        )}

        {before ? (
          <div className="mb-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
            <div className={COPY_FIELD_HEADER_BAND_CLASS}>
              <p className={`${COPY_FIELD_LABEL_CLASS} text-neutral-400`}>Before</p>
            </div>
            <p className="text-[16px] font-normal leading-5 text-neutral-600">{before}</p>
          </div>
        ) : null}

        <div className="space-y-3">
          {directions.options.map((option, index) => {
            const copyIndex = copyIndexOffset + index;

            return (
              <div
                key={`${option.label}-${index}`}
                className={`relative rounded-2xl border p-5 ${IMPROVED_COPY_PANEL_CLASS}`}
              >
                <div className={`${COPY_FIELD_HEADER_BAND_CLASS} justify-between gap-3`}>
                  <p className={`${COPY_FIELD_LABEL_CLASS} ${IMPROVED_COPY_LABEL_CLASS}`}>
                    Option {String.fromCharCode(65 + index)} — {option.label}
                  </p>

                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => onCopy(option.text, copyIndex)}
                      disabled={copyLocked}
                      className={[
                        "flex h-9 w-9 items-center justify-center rounded-xl border",
                        copyLocked
                          ? "cursor-not-allowed border-[rgba(6,28,47,0.08)] bg-white text-[rgba(6,28,47,0.35)]"
                          : IMPROVED_COPY_BUTTON_CLASS,
                      ].join(" ")}
                      aria-label={
                        copyLocked
                          ? "Copy available after unlocking the full report"
                          : `Copy option ${String.fromCharCode(65 + index)}`
                      }
                    >
                      {copyLocked ? (
                        <RiLock2Line size={16} aria-hidden />
                      ) : copiedIndex === copyIndex ? (
                        <RiCheckLine size={18} />
                      ) : (
                        <RiFileCopyLine size={18} />
                      )}
                    </button>

                    {!copyLocked && copiedIndex === copyIndex && (
                      <div
                        className={`absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-medium shadow-sm ${IMPROVED_COPY_TOAST_CLASS}`}
                      >
                        Copied
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[16px] font-medium leading-5 text-[var(--ink-primary)]">
                  {option.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </ReportVariantCard>
  );
}
