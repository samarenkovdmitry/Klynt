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
import { ReportSectionShell } from "@/components/report/ReportSectionShell";
import type { RequestProUpgrade } from "@/lib/freemium";

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
    <ReportSectionShell
      id="trust"
      icon={<RiShieldCheckLine size={20} aria-hidden />}
      title="Trust & meta"
    >
      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 md:p-6">
        <div className="rounded-[16px] border border-[rgba(6,28,47,0.06)] bg-[#FAFBFC] p-4">
          <div className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-[#061C2F]">
            <RiAwardLine size={16} className="text-[#7D8C99]" aria-hidden />
            Add proof
          </div>

          {trustGaps.length === 0 && !(meta.trust_notes?.length ?? 0) ? (
            <p className="text-[14px] leading-6 text-[#059669]">Trust signals look good</p>
          ) : (
            <>
              <ul className="mb-3 space-y-2">
                {trustGaps.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-2 text-[14px] leading-6 text-[rgba(6,28,47,0.72)]"
                  >
                    <RiErrorWarningLine
                      size={16}
                      className="mt-0.5 shrink-0 text-[#BA7517]"
                      aria-hidden
                    />
                    <span>{item.text}</span>
                  </li>
                ))}
                {(meta.trust_notes ?? []).map((note) => (
                  <li
                    key={note}
                    className="flex items-start gap-2 text-[14px] leading-6 text-[rgba(6,28,47,0.72)]"
                  >
                    <RiErrorWarningLine
                      size={16}
                      className="mt-0.5 shrink-0 text-[#BA7517]"
                      aria-hidden
                    />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>

              {meta.proof_suggestion ? (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-3 py-1.5 text-[13px] font-medium text-[#059669]">
                  <RiAddLine size={14} aria-hidden />
                  {meta.proof_suggestion}
                </div>
              ) : null}
            </>
          )}
        </div>

        <div className="rounded-[16px] border border-[rgba(6,28,47,0.06)] bg-[#FAFBFC] p-4">
          <div className="mb-3 flex items-center gap-2 text-[14px] font-semibold text-[#061C2F]">
            <RiSearchLine size={16} className="text-[#7D8C99]" aria-hidden />
            Meta
          </div>

          <div className="mb-4">
            <div className="mb-1.5 text-[13px] font-medium text-[#7D8C99]">Title</div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-[14px] leading-6 text-[#061C2F]">{meta.title_suggestion}</span>
              <CopyButton
                value={meta.title_suggestion}
                locked={metaCopyLocked}
                onRequestProUpgrade={onRequestProUpgrade}
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-[13px] font-medium text-[#7D8C99]">Description</div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-[14px] leading-6 text-[#061C2F]">
                {meta.description_suggestion}
              </span>
              <CopyButton
                value={meta.description_suggestion}
                locked={metaCopyLocked}
                onRequestProUpgrade={onRequestProUpgrade}
              />
            </div>
          </div>
        </div>
      </div>
    </ReportSectionShell>
  );
}
