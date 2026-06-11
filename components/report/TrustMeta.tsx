"use client";

import { useState } from "react";
import {
  RiShieldCheckLine,
  RiAwardLine,
  RiErrorWarningLine,
  RiAddLine,
  RiSearchLine,
  RiCheckLine,
  RiFileCopyLine,
} from "@remixicon/react";
import type { ReportMeta, ReportChecklistItem } from "@/lib/audit-report";
import {
  REPORT_SECTION_SCROLL_MARGIN_CLASS,
  REPORT_SECTION_SPACING_CLASS,
} from "@/components/report/reportStyles";

type Props = {
  meta: ReportMeta;
  checklist: ReportChecklistItem[];
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="ml-1.5 shrink-0 rounded-md p-1 text-[#999] transition-colors hover:bg-[#F0F0EE] hover:text-[#555]"
      aria-label="Copy"
    >
      {copied ? <RiCheckLine size={14} /> : <RiFileCopyLine size={14} />}
    </button>
  );
}

export function TrustMeta({ meta, checklist }: Props) {
  const trustGaps = checklist.filter(
    (item) => item.category === "trust" && item.status !== "pass"
  );

  return (
    <div
      id="trust"
      className={[REPORT_SECTION_SPACING_CLASS, REPORT_SECTION_SCROLL_MARGIN_CLASS].join(" ")}
    >
      <div className="overflow-hidden rounded-[16px] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.04),0_4px_20px_rgba(0,0,0,0.07)]">
        {/* Section header */}
        <div className="flex items-center px-5 pb-2.5 pt-3.5">
          <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.07em] text-[#999]">
            <RiShieldCheckLine size={14} aria-hidden />
            Trust &amp; meta
          </span>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 gap-2.5 px-5 pb-4 sm:grid-cols-2">
          {/* Add proof card */}
          <div className="rounded-[10px] bg-[#F5F5F3] p-3.5">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#999]">
              <RiAwardLine size={13} aria-hidden />
              Add proof
            </div>

            {trustGaps.length === 0 ? (
              <p className="text-[13px] leading-[1.5] text-[#1D9E75]">
                Trust signals look good
              </p>
            ) : (
              <>
                <ul className="mb-2 space-y-1.5">
                  {trustGaps.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start gap-1.5 text-[13px] leading-[1.5] text-[#555]"
                    >
                      <RiErrorWarningLine
                        size={14}
                        className="mt-[2px] shrink-0 text-[#D4832A]"
                        aria-hidden
                      />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>

                <button className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F7F2] px-2.5 py-1 text-[12px] font-medium text-[#0F6E56] transition-colors hover:bg-[#D4F0E8]">
                  <RiAddLine size={13} aria-hidden />
                  Add CISO quote below CTA
                </button>
              </>
            )}
          </div>

          {/* Meta card */}
          <div className="rounded-[10px] bg-[#F5F5F3] p-3.5">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#999]">
              <RiSearchLine size={13} aria-hidden />
              Meta
            </div>

            <div className="mb-3">
              <div className="mb-1 text-[11px] uppercase tracking-[0.05em] text-[#aaa]">
                Title
              </div>
              <div className="flex items-start justify-between gap-1">
                <span className="text-[13px] leading-[1.5] text-[#111]">
                  {meta.title_suggestion}
                </span>
                <CopyButton value={meta.title_suggestion} />
              </div>
            </div>

            <div>
              <div className="mb-1 text-[11px] uppercase tracking-[0.05em] text-[#aaa]">
                Description
              </div>
              <div className="flex items-start justify-between gap-1">
                <span className="text-[13px] leading-[1.5] text-[#111]">
                  {meta.description_suggestion}
                </span>
                <CopyButton value={meta.description_suggestion} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
