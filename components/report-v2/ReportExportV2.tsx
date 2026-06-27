"use client";

import {
  RiDownloadLine,
  RiFileTextLine,
  RiLayoutLine,
  RiCodeSSlashLine,
  RiNotification3Line,
} from "@remixicon/react";
import type { ExportType } from "@/lib/report-export-content";

type Props = {
  onExport: (type: ExportType) => void;
  locked?: boolean;
};

const EXPORT_OPTIONS: { icon: React.ElementType; label: string; sub: string; type: ExportType }[] = [
  { icon: RiFileTextLine,    label: "Copy deck",      sub: "ALL VARIANTS · MD",  type: "copy_deck"      },
  { icon: RiLayoutLine,      label: "Designer brief", sub: "FIGMA TASK LIST",    type: "designer_brief" },
  { icon: RiCodeSSlashLine,  label: "Dev tasks",      sub: "CSS + TEXT CHANGES", type: "dev_tasks"      },
  { icon: RiNotification3Line, label: "Notion / Slack", sub: "FORMATTED TO SHARE", type: "notion_slack" },
];

export function ReportExportV2({ onExport }: Props) {
  return (
    <section
      id="export"
      className="overflow-hidden rounded-[16px] border border-v2-card-border bg-v2-card shadow-[0_1px_2px_rgba(27,26,23,0.03)]"
    >
      <div className="flex items-center gap-2.5 border-b border-v2-card-divider px-6 py-[17px]">
        <RiDownloadLine size={19} className="text-v2-ink" />
        <span className="text-[18px] font-semibold tracking-[-0.01em] text-v2-ink">Export</span>
        <span className="font-mono ml-auto text-[11.5px] tracking-[0.04em] text-v2-ink-faint">
          TAKE THIS TO YOUR TEAM
        </span>
      </div>

      <div className="grid grid-cols-2 divide-x divide-y divide-v2-card-divider sm:grid-cols-4 sm:divide-y-0">
        {EXPORT_OPTIONS.map(({ icon: Icon, label, sub, type }) => (
          <button
            key={type}
            onClick={() => onExport(type)}
            className="flex flex-col items-start p-5 text-left transition-colors hover:bg-v2-card-inner"
          >
            <Icon size={18} className="text-v2-ink-secondary" />
            <p className="mt-2.5 mb-0.5 text-[14.5px] font-semibold text-v2-ink">{label}</p>
            <p className="font-mono text-[11px] tracking-[0.03em] text-v2-ink-muted">{sub}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
