"use client";

import { useEffect, useRef, useState } from "react";
import {
  RiShare2Line,
  RiFileTextLine,
  RiLayoutLine,
  RiCodeSSlashLine,
  RiSendPlaneLine,
  RiArrowDownSLine,
} from "@remixicon/react";
import type { ExportType } from "@/lib/report-export-content";
import { FaviconImg } from "@/components/examples/FaviconImg";

type Props = {
  url?: string;
  domain: string;
  generatedAt?: string;
  checklistCount?: number;
  isUnlocked?: boolean;
  onShare: () => void;
  onExport: (type: ExportType) => void;
  onPaywall: () => void;
};

const EXPORT_OPTIONS: { icon: React.ElementType; label: string; type: ExportType }[] = [
  { icon: RiFileTextLine,      label: "Copy deck",      type: "copy_deck"      },
  { icon: RiLayoutLine,        label: "Designer brief", type: "designer_brief" },
  { icon: RiCodeSSlashLine,    label: "Dev tasks",      type: "dev_tasks"      },
  { icon: RiSendPlaneLine,      label: "Notion / Slack", type: "notion_slack"   },
];

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
  isUnlocked = false,
  onShare,
  onExport,
  onPaywall,
}: Props) {
  const date = formatDate(generatedAt);
  const signalCount = checklistCount ? checklistCount * 9 : 85;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [dropdownOpen]);

  function handleSelect(type: ExportType) {
    setDropdownOpen(false);
    if (isUnlocked) {
      onExport(type);
    } else {
      onPaywall();
    }
  }

  return (
    <div className="flex flex-nowrap items-center gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-[#E8E4DB] bg-[#F4F1EB]">
        <FaviconImg domain={domain} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-[15px] font-bold tracking-[-0.01em] text-v2-ink">{domain}</span>
        <span className="font-mono text-[11px] tracking-[0.04em] text-v2-ink-muted">
          {date && <span className="sm:hidden">{date}</span>}
          {date && <span className="hidden sm:inline">ANALYSED {date} · {signalCount} SIGNALS</span>}
          {!date && <span>{signalCount} SIGNALS</span>}
        </span>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2.5">
        <button
          onClick={onShare}
          className="inline-flex items-center gap-1.5 rounded-[9px] border border-v2-card-border bg-v2-card px-[15px] py-[10px] text-[15px] font-semibold text-v2-ink-secondary transition-colors hover:bg-v2-card-inner"
        >
          <RiShare2Line size={16} />
          Share
        </button>

        <div ref={wrapperRef} className="relative">
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="inline-flex items-center gap-1.5 rounded-[9px] border border-v2-ink bg-v2-ink px-4 py-[10px] text-[15px] font-semibold text-white transition-colors hover:bg-v2-dark-alt"
          >
            Use report
            <RiArrowDownSLine
              size={14}
              className={`opacity-60 transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-1.5 min-w-[172px] overflow-hidden rounded-[12px] border border-v2-card-border bg-[#FAF9F4] shadow-[0_4px_20px_rgba(27,26,23,0.10)]">
              {EXPORT_OPTIONS.map(({ icon: Icon, label, type }) => (
                <button
                  key={type}
                  onClick={() => handleSelect(type)}
                  className="flex w-full items-center gap-2.5 px-4 py-[10px] text-left text-[13.5px] font-medium text-v2-ink transition-colors hover:bg-v2-card-inner first:pt-[12px] last:pb-[12px]"
                >
                  <Icon size={15} className="shrink-0 text-v2-ink-secondary" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
