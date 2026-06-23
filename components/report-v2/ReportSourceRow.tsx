"use client";

import { RiShareLine, RiFileDownloadLine } from "@remixicon/react";

type Props = {
  url?: string;
  domain: string;
  generatedAt?: string;
  checklistCount?: number;
  previewSrc?: string | null;
  onShare: () => void;
  onExport: () => void;
};

function formatDate(iso?: string) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).toUpperCase();
  } catch {
    return null;
  }
}

export function ReportSourceRow({
  domain,
  generatedAt,
  checklistCount,
  previewSrc,
  onShare,
  onExport,
}: Props) {
  const date = formatDate(generatedAt);
  const signalCount = checklistCount ? checklistCount * 9 : 85;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {previewSrc && (
        <span className="block shrink-0 overflow-hidden rounded-lg border border-v2-card-border leading-none">
          <img
            src={previewSrc}
            alt={domain}
            className="block h-11 w-16 object-cover object-top"
          />
        </span>
      )}

      <div className="flex flex-col gap-1.5">
        <span className="text-[15px] font-bold tracking-[-0.01em] text-v2-ink">{domain}</span>
        <span className="font-mono text-[11px] tracking-[0.04em] text-v2-ink-muted">
          {date && `ANALYSED ${date} · `}
          {signalCount} SIGNALS
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        <button
          onClick={onShare}
          className="inline-flex items-center gap-1.5 rounded-[9px] border border-v2-card-border bg-v2-card px-[15px] py-[9px] text-[13px] font-semibold text-v2-ink-secondary transition-colors hover:bg-v2-card-inner"
        >
          <RiShareLine size={15} />
          Share
        </button>
        <button
          onClick={onExport}
          className="relative inline-flex items-center gap-1.5 rounded-[9px] border border-v2-ink bg-v2-ink px-4 py-[9px] text-[13px] font-semibold text-white transition-colors hover:bg-v2-dark-alt"
        >
          <RiFileDownloadLine size={15} />
          Export
        </button>
      </div>
    </div>
  );
}
