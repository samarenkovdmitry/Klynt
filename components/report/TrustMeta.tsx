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
import type { RequestProUpgrade } from "@/lib/freemium";
import {
  REPORT_SECTION_SPACING_CLASS,
  REPORT_SECTION_SCROLL_MARGIN_CLASS,
} from "@/components/report/reportStyles";
import { SectionHeader } from "@/components/report/ReportSectionHeader";

type Props = {
  meta: ReportMeta;
  checklist: ReportChecklistItem[];
  metaCopyLocked?: boolean;
  onRequestProUpgrade?: RequestProUpgrade;
};

function CopyButton({
  value,
  locked = false,
  onRequestProUpgrade,
}: {
  value: string;
  locked?: boolean;
  onRequestProUpgrade?: RequestProUpgrade;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (locked) {
      onRequestProUpgrade?.("meta-copy");
      return;
    }

    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="ml-1.5 shrink-0 rounded-lg p-1.5 text-[#7D8C99] transition-colors hover:bg-[#ECF0F6] hover:text-[#061C2F]"
      aria-label={locked ? "Upgrade to Pro to copy" : "Copy"}
    >
      {copied ? <RiCheckLine size={14} /> : <RiFileCopyLine size={14} />}
    </button>
  );
}

export function TrustMeta({
  meta,
  checklist,
  metaCopyLocked = false,
  onRequestProUpgrade,
}: Props) {
  const trustGaps = checklist.filter(
    (item) => item.category === "trust" && item.status !== "pass"
  );

  return (
    <section
      id="trust"
      className={`${REPORT_SECTION_SPACING_CLASS} ${REPORT_SECTION_SCROLL_MARGIN_CLASS}`}
    >
      <SectionHeader icon={RiShieldCheckLine} title="Trust & meta" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Left card — Add proof */}
        <div className="rounded-[16px] bg-white p-5 shadow-[0_0_0_1px_rgba(6,28,47,0.08)]">
          <div className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-[#061C2F]">
            <RiAwardLine size={16} className="text-[#7D8C99]" aria-hidden />
            Add proof
          </div>

          {trustGaps.length === 0 && !(meta.trust_notes?.length ?? 0) ? (
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
                {(meta.trust_notes ?? []).map((note) => (
                  <li
                    key={note}
                    className="flex items-center gap-2 text-[14px] leading-[21px] text-[#061C2F]"
                  >
                    <RiErrorWarningLine
                      size={16}
                      className="shrink-0 text-status-weak"
                      aria-hidden
                    />
                    <span>{note}</span>
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

        {/* Right card — Meta */}
        <div className="rounded-[16px] bg-white p-5 shadow-[0_0_0_1px_rgba(6,28,47,0.08)]">
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
                <CopyButton
                  value={meta.title_suggestion}
                  locked={metaCopyLocked}
                  onRequestProUpgrade={onRequestProUpgrade}
                />
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
                <CopyButton
                  value={meta.description_suggestion}
                  locked={metaCopyLocked}
                  onRequestProUpgrade={onRequestProUpgrade}
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
