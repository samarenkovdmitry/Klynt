"use client";

import { useState, useCallback } from "react";
import {
  RiFileTextLine,
  RiLayoutGridLine,
  RiCodeLine,
  RiNotification3Line,
  RiLock2Line,
  RiCheckLine,
} from "@remixicon/react";
import type { ReportChecklistItem, ReportCopyVariants, ReportMeta, ReportVisualFix } from "@/lib/audit-report";
import { buildVisualFixesMarkdown } from "@/lib/report-visual-fixes";
import type { ProUpgradeTrigger, RequestProUpgrade } from "@/lib/freemium";

interface ExportGridProps {
  copyVariants: ReportCopyVariants;
  meta: ReportMeta;
  checklist?: ReportChecklistItem[];
  visualFixes?: ReportVisualFix[];
  locked?: boolean;
  onRequestProUpgrade?: RequestProUpgrade;
}

type CardId = "copy-deck" | "designer-brief" | "dev-tasks" | "notion-slack";

const CARD_TRIGGERS: Record<CardId, ProUpgradeTrigger> = {
  "copy-deck": "export-copy-deck",
  "designer-brief": "export-designer-brief",
  "dev-tasks": "export-dev-tasks",
  "notion-slack": "export-notion-slack",
};

function buildCopyDeckMarkdown(variants: ReportCopyVariants): string {
  const LABELS: { key: keyof ReportCopyVariants; title: string }[] = [
    { key: "headline", title: "Headline" },
    { key: "cta", title: "CTA" },
    { key: "subheadline", title: "Subheadline" },
  ];

  return LABELS.map(({ key, title }) => {
    const block = variants[key];
    const lines = [
      `## ${title}`,
      `**Current:** ${block.current}`,
      ...block.variants.map((v, i) => `**Variant ${i + 1} (${v.label}):** ${v.text}`),
    ];
    return lines.join("\n");
  }).join("\n\n");
}

function buildDesignerBriefMarkdown(
  variants: ReportCopyVariants,
  meta: ReportMeta,
  visualFixes?: ReportVisualFix[]
): string {
  const LABELS: { key: keyof ReportCopyVariants; title: string }[] = [
    { key: "headline", title: "Hero headline" },
    { key: "cta", title: "Primary CTA" },
    { key: "subheadline", title: "Subheadline" },
  ];

  const copyLines = LABELS.flatMap(({ key, title }) => {
    const block = variants[key];
    const best = block.variants[0]?.text ?? block.current;
    return [`- **${title}:** ${best}`];
  });

  const visualLines =
    visualFixes && visualFixes.length > 0
      ? ["", "## Visual direction", buildVisualFixesMarkdown(visualFixes)]
      : [];

  return [
    "# Designer Brief",
    "",
    "## Copy updates",
    ...copyLines,
    "",
    "## Meta updates",
    `- **Page title:** ${meta.title_suggestion}`,
    `- **Meta description:** ${meta.description_suggestion}`,
    ...visualLines,
  ].join("\n");
}

function buildDevTasksMarkdown(
  variants: ReportCopyVariants,
  meta: ReportMeta,
  checklist?: ReportChecklistItem[],
  visualFixes?: ReportVisualFix[]
): string {
  const LABELS: { key: keyof ReportCopyVariants; selector: string }[] = [
    { key: "headline", selector: "<h1>" },
    { key: "cta", selector: "[data-cta]" },
    { key: "subheadline", selector: "<p.subheadline>" },
  ];

  const textChanges = LABELS.map(({ key, selector }) => {
    const block = variants[key];
    const best = block.variants[0]?.text ?? block.current;
    return `- \`${selector}\` → "${best}"`;
  });

  const visualLines =
    visualFixes && visualFixes.length > 0
      ? ["", "## Visual fixes", buildVisualFixesMarkdown(visualFixes)]
      : checklist?.find((item) => item.link_to === "visual-fixes" && item.status === "weak")
        ? [
            "",
            "## Visual fixes",
            "- Subheadline: 18px / weight 500 / line-height 1.5",
          ]
        : [];

  return [
    "# Dev Tasks",
    "",
    "## Text changes",
    ...textChanges,
    "",
    "## Meta tags",
    `- \`<title>\` → "${meta.title_suggestion}"`,
    `- \`<meta name="description">\` → "${meta.description_suggestion}"`,
    ...visualLines,
  ].join("\n");
}

function buildNotionSlackMarkdown(
  variants: ReportCopyVariants,
  meta: ReportMeta
): string {
  const headline = variants.headline.variants[0]?.text ?? variants.headline.current;
  const cta = variants.cta.variants[0]?.text ?? variants.cta.current;
  const subheadline = variants.subheadline.variants[0]?.text ?? variants.subheadline.current;

  return [
    "📊 *UX Audit — Copy Recommendations*",
    "",
    `*Headline:* ${headline}`,
    `*CTA:* ${cta}`,
    `*Subheadline:* ${subheadline}`,
    "",
    `*Page title:* ${meta.title_suggestion}`,
    `*Meta description:* ${meta.description_suggestion}`,
  ].join("\n");
}

interface ExportCardProps {
  icon: React.ReactNode;
  title: string;
  sub: string;
  cardId: CardId;
  activeToast: CardId | null;
  locked: boolean;
  onClick: (id: CardId) => void;
}

function ExportCard({ icon, title, sub, cardId, activeToast, locked, onClick }: ExportCardProps) {
  const copied = activeToast === cardId;

  return (
    <button
      type="button"
      onClick={() => onClick(cardId)}
      className="group relative w-full cursor-pointer rounded-[16px] bg-white p-5 text-left transition-[border-color,box-shadow] duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#061C2F]/15"
      style={{
        border: "1px solid",
        borderColor: copied ? "rgba(29,158,117,0.3)" : "#E5E5E5",
      }}
    >
      <div className="flex items-start justify-between">
        <span className="text-[#8F99A2]">{icon}</span>

        {/* Top-right: lock icon ↔ Copied indicator crossfade */}
        <span className="relative flex h-[18px] min-w-[18px] items-center justify-end">
          <span
            className="absolute right-0 flex items-center gap-1 whitespace-nowrap text-[13px] font-medium text-[#1D9E75] transition-opacity duration-300"
            style={{ opacity: copied ? 1 : 0, pointerEvents: "none" }}
            aria-hidden={!copied}
          >
            <RiCheckLine size={14} />
            Copied
          </span>
          <span
            className="transition-opacity duration-300"
            style={{ opacity: copied ? 0 : 1, pointerEvents: copied ? "none" : "auto" }}
          >
            {locked && <RiLock2Line size={18} className="text-[#8F99A2]" aria-hidden />}
          </span>
        </span>
      </div>

      <div className="mt-4 text-[15px] font-semibold text-[#061C2F]">{title}</div>
      <div className="mt-1 text-[13px] leading-5 text-[#8E99A2]">{sub}</div>
    </button>
  );
}

export function ExportGrid({
  copyVariants,
  meta,
  checklist,
  visualFixes,
  locked = false,
  onRequestProUpgrade,
}: ExportGridProps) {
  const [activeToast, setActiveToast] = useState<CardId | null>(null);

  const copyToClipboard = useCallback(
    async (id: CardId) => {
      if (locked) {
        onRequestProUpgrade?.(CARD_TRIGGERS[id]);
        return;
      }

      let text = "";

      switch (id) {
        case "copy-deck":
          text = buildCopyDeckMarkdown(copyVariants);
          break;
        case "designer-brief":
          text = buildDesignerBriefMarkdown(copyVariants, meta, visualFixes);
          break;
        case "dev-tasks":
          text = buildDevTasksMarkdown(copyVariants, meta, checklist, visualFixes);
          break;
        case "notion-slack":
          text = buildNotionSlackMarkdown(copyVariants, meta);
          break;
      }

      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const el = document.createElement("textarea");
        el.value = text;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }

      setActiveToast(id);
      setTimeout(() => setActiveToast(null), 1800);
    },
    [copyVariants, meta, checklist, visualFixes, locked, onRequestProUpgrade]
  );

  const CARDS: {
    id: CardId;
    icon: React.ReactNode;
    title: string;
    sub: string;
  }[] = [
    {
      id: "copy-deck",
      icon: <RiFileTextLine size={24} />,
      title: "Copy deck",
      sub: "All variants · Markdown",
    },
    {
      id: "designer-brief",
      icon: <RiLayoutGridLine size={24} />,
      title: "Designer brief",
      sub: "Figma-ready task list",
    },
    {
      id: "dev-tasks",
      icon: <RiCodeLine size={24} />,
      title: "Dev tasks",
      sub: "CSS values + text changes",
    },
    {
      id: "notion-slack",
      icon: <RiNotification3Line size={24} />,
      title: "Notion / Slack",
      sub: "Formatted for sharing",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {CARDS.map((card) => (
        <ExportCard
          key={card.id}
          icon={card.icon}
          title={card.title}
          sub={card.sub}
          cardId={card.id}
          activeToast={activeToast}
          locked={locked}
          onClick={copyToClipboard}
        />
      ))}
    </div>
  );
}
