"use client";

import { useEffect, useState } from "react";
import { RiCloseLine, RiFileCopyLine, RiDownload2Line, RiCheckLine } from "@remixicon/react";
import type { AuditReport } from "@/lib/audit-report";
import {
  generateExportContent,
  getExportFilename,
  type ExportType,
} from "@/lib/report-export-content";

type Props = {
  open: boolean;
  onClose: () => void;
  type: ExportType;
  report: AuditReport;
};

const META: Record<ExportType, { title: string; sub: string; copyLabel: string; download: boolean }> = {
  copy_deck:      { title: "Copy deck",      sub: "ALL VARIANTS · MD",  copyLabel: "Copy MD",           download: true  },
  designer_brief: { title: "Designer brief", sub: "FIGMA TASK LIST",    copyLabel: "Copy MD",           download: true  },
  dev_tasks:      { title: "Dev tasks",      sub: "CSS + TEXT CHANGES", copyLabel: "Copy MD",           download: true  },
  notion_slack:   { title: "Notion / Slack", sub: "FORMATTED TO SHARE", copyLabel: "Copy to clipboard", download: false },
};

export function ExportModal({ open, onClose, type, report }: Props) {
  const [copied, setCopied] = useState(false);
  const meta    = META[type];
  const content = generateExportContent(type, report);

  useEffect(() => {
    if (!open) { setCopied(false); return; }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = getExportFilename(type, report.url);
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        aria-label="Close"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
        className="relative z-[1] flex w-full max-w-[640px] flex-col overflow-hidden rounded-[24px] border border-v2-card-border bg-[#FAF9F4] shadow-[0_8px_40px_rgba(27,26,23,0.12)]"
      >
        <div className="flex items-center gap-3 border-b border-v2-card-divider px-6 py-4">
          <div>
            <h2
              id="export-modal-title"
              className="text-[15px] font-semibold tracking-[-0.01em] text-v2-ink"
            >
              {meta.title}
            </h2>
            <p className="font-mono text-[11px] tracking-[0.04em] text-v2-ink-faint">{meta.sub}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-v2-card-inner text-v2-ink-muted transition-colors hover:bg-[#ECEAE2] hover:text-v2-ink"
            aria-label="Close"
          >
            <RiCloseLine size={18} aria-hidden />
          </button>
        </div>

        <pre className="max-h-[360px] overflow-y-auto whitespace-pre-wrap break-words bg-v2-card-inner px-6 py-5 font-mono text-[12px] leading-[1.75] text-v2-ink-secondary">
          {content}
        </pre>

        <div className="flex items-center justify-end gap-2.5 border-t border-v2-card-divider px-6 py-4">
          {meta.download && (
            <button
              type="button"
              onClick={handleDownload}
              className="flex h-9 items-center gap-1.5 rounded-full border border-v2-card-border bg-v2-card px-4 text-[13px] font-medium text-v2-ink transition-colors hover:bg-v2-card-inner"
            >
              <RiDownload2Line size={14} aria-hidden />
              Download .md
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="flex h-9 items-center gap-1.5 rounded-full bg-v2-ink px-5 text-[13px] font-semibold text-white transition-opacity hover:opacity-80"
          >
            {copied ? (
              <><RiCheckLine size={14} aria-hidden /> Copied!</>
            ) : (
              <><RiFileCopyLine size={14} aria-hidden /> {meta.copyLabel}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
