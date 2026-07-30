"use client";

import { useState } from "react";
import {
  RiShieldCheckLine,
  RiAwardLine,
  RiErrorWarningLine,
  RiArrowRightLine,
  RiSearchLine,
  RiCheckLine,
  RiFileCopyLine,
} from "@remixicon/react";
import type { ReportMeta, ReportChecklistItem } from "@/lib/audit-report";
import {
  REPORT_NEW_SECTION_BODY_GAP_CLASS,
  ReportNewSectionHeader,
} from "@/components/report/ReportNewSectionHeader";
import {
  REPORT_SECTION_SPACING_CLASS,
  REPORT_SECTION_SCROLL_MARGIN_CLASS,
  REPORT_SURFACE_CARD_CLASS,
} from "@/components/report/reportStyles";

type Props = {
  meta?: ReportMeta;
  checklist?: ReportChecklistItem[];
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
      className="ml-1.5 shrink-0 rounded-lg p-1.5 text-[#7D8C99] transition-colors hover:bg-[#ECF0F6] hover:text-[#061C2F]"
      aria-label="Copy"
    >
      {copied ? <RiCheckLine size={14} /> : <RiFileCopyLine size={14} />}
    </button>
  );
}

export function ReportTrustMetaSection({ meta, checklist = [] }: Props) {
  if (!meta) return null;

  const trustGaps = checklist.filter(
    (item) => item.category === "trust" && item.status !== "pass"
  );

  return (
    <section
      id="trust"
      className={`${REPORT_SECTION_SPACING_CLASS} ${REPORT_SECTION_SCROLL_MARGIN_CLASS}`}
    >
      <ReportNewSectionHeader
        icon={<RiShieldCheckLine size={22} />}
        title="Trust & meta"
        suffix={String(trustGaps.length || 1)}
      />

      <div className={`${REPORT_NEW_SECTION_BODY_GAP_CLASS} ${REPORT_SURFACE_CARD_CLASS}`}>
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="border-b border-[#eef1f5] p-6 md:border-b-0 md:border-r md:border-[#eef1f5]">
            <div className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-[#061C2F]">
              <RiAwardLine size={16} className="text-[#7D8C99]" aria-hidden />
              Add proof
            </div>

            {trustGaps.length === 0 ? (
              <p className="text-[14px] leading-6 text-status-good">Trust signals look good</p>
            ) : (
              <>
                <ul className="mb-3 space-y-2">
                  {trustGaps.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-2 text-[14px] leading-[21px] text-[#061C2F]"
                    >
                      <RiErrorWarningLine
                        size={16}
                        className="shrink-0 text-status-weak"
                        aria-hidden
                      />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>

                {meta.proof_suggestion ? (
                  <div className="flex items-center gap-2 rounded-[10px] bg-[#EFF3F6] px-[14px] py-3 text-[14px] text-[#061C2F]">
                    <RiArrowRightLine size={16} className="shrink-0 text-[#0D9488]" aria-hidden />
                    {meta.proof_suggestion}
                  </div>
                ) : null}
              </>
            )}
          </div>

          <div className="p-6">
            <div className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-[#061C2F]">
              <RiSearchLine size={16} className="text-[#7D8C99]" aria-hidden />
              Meta
            </div>

            <div className="group mb-3">
              <div className="mb-1 text-[13px] font-medium text-[#8E99A2]">Title</div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[16px] font-semibold leading-6 text-[#061C2F]">
                  {meta.title_suggestion}
                </span>
                <span className="opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  <CopyButton value={meta.title_suggestion} />
                </span>
              </div>
            </div>

            <div className="group">
              <div className="mb-1 text-[13px] font-medium text-[#8E99A2]">Description</div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[14px] leading-[21px] text-[#061C2F]">
                  {meta.description_suggestion}
                </span>
                <span className="opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  <CopyButton value={meta.description_suggestion} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
