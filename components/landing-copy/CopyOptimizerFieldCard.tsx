"use client";

import { useState } from "react";
import { RiCheckLine, RiFileCopyLine } from "@remixicon/react";

import { PriorityBadge } from "@/components/report/ImpactBadges";
import {
  IMPROVED_COPY_BUTTON_CLASS,
  IMPROVED_COPY_LABEL_CLASS,
  IMPROVED_COPY_PANEL_CLASS,
  IMPROVED_COPY_TOAST_CLASS,
  getPriorityLabel,
} from "@/lib/report-priority";
import type { CopyOptimizerField, CopyOptimizerLayer } from "@/lib/copy-optimize";
import { getCopyOptimizerLayerLabel } from "@/lib/copy-optimize";
import { REPORT_WHY_BODY_CLASS, REPORT_WHY_BODY_MEASURE_CLASS } from "@/components/report/reportStyles";

const COPY_FIELD_HEADER_BAND_CLASS = "mb-3 flex min-h-9 items-center";
const COPY_FIELD_LABEL_CLASS =
  "text-[12px] font-semibold uppercase tracking-[0.08em]";

type CopyOptimizerFieldCardProps = {
  layer: CopyOptimizerLayer;
  field: CopyOptimizerField;
};

export function CopyOptimizerFieldCard({ layer, field }: CopyOptimizerFieldCardProps) {
  const [copied, setCopied] = useState(false);
  const priorityLabel = field.priority ? getPriorityLabel({ priority: field.priority }) : null;

  async function handleCopy() {
    if (!field.after) return;

    await navigator.clipboard.writeText(field.after);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <article className="rounded-[18px] border border-[rgba(6,28,47,0.06)] bg-white p-5 shadow-[0_16px_48px_rgba(0,0,0,0.08)] md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--ink-primary)] md:text-[16px]">
          {getCopyOptimizerLayerLabel(layer)}
        </h3>
        {priorityLabel ? <PriorityBadge label={priorityLabel} className="shrink-0" /> : null}
      </div>

      {field.why ? (
        <p className={`mt-2 ${REPORT_WHY_BODY_CLASS} ${REPORT_WHY_BODY_MEASURE_CLASS}`}>
          {field.why}
        </p>
      ) : null}

      <div className="mt-4 grid gap-3 md:gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
          <div className={COPY_FIELD_HEADER_BAND_CLASS}>
            <p className={`${COPY_FIELD_LABEL_CLASS} text-neutral-400`}>Before</p>
          </div>
          <p className="text-[16px] font-normal leading-5 text-neutral-600">
            {field.before || "Not detected above the fold"}
          </p>
        </div>

        <div className={`relative rounded-2xl border p-5 ${IMPROVED_COPY_PANEL_CLASS}`}>
          <div className={`${COPY_FIELD_HEADER_BAND_CLASS} justify-between gap-3`}>
            <p className={`${COPY_FIELD_LABEL_CLASS} ${IMPROVED_COPY_LABEL_CLASS}`}>Improved</p>

            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => void handleCopy()}
                disabled={!field.after}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border ${IMPROVED_COPY_BUTTON_CLASS}`}
                aria-label="Copy improved text"
              >
                {copied ? <RiCheckLine size={18} /> : <RiFileCopyLine size={18} />}
              </button>

              {copied && (
                <div
                  className={`absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-medium shadow-sm ${IMPROVED_COPY_TOAST_CLASS}`}
                >
                  Copied
                </div>
              )}
            </div>
          </div>

          <p className="text-[16px] font-medium leading-5 text-[var(--ink-primary)]">
            {field.after}
          </p>
        </div>
      </div>
    </article>
  );
}
