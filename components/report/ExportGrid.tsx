"use client";

import { useState, useCallback } from "react";
import {
  RiFileTextLine,
  RiLayoutGridLine,
  RiCodeSSlashLine,
  RiNotification4Line,
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
  onClick: (id: CardId) => void;
}

function ExportCard({ icon, title, sub, cardId, activeToast, onClick }: ExportCardProps) {
  const copied = activeToast === cardId;

  return (
    <button
      type="button"
      onClick={() => onClick(cardId)}
      className="group relative w-full cursor-pointer rounded-[16px] border border-[rgba(6,28,47,0.06)] bg-[#FAFBFC] p-4 text-left transition-all duration-[120ms] hover:-translate-y-px hover:border-[rgba(6,28,47,0.12)] hover:bg-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#061C2F]/15"
    >
      <div className="mb-2 leading-none text-[#7D8C99]">{icon}</div>
      <div className="mb-1 text-[14px] font-semibold text-[#061C2F]">{title}</div>
      <div className="text-[13px] leading-5 text-[#7D8C99]">{sub}</div>

      {copied && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center gap-1.5 rounded-[16px] bg-[#061C2F]/90 text-[13px] font-medium text-white">
          <RiCheckLine size={14} />
          Copied!
        </span>
      )}
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
      setTimeout(() => setActiveToast(null), 2000);
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
      icon: <RiFileTextLine size={20} />,
      title: "Copy deck",
      sub: "All variants · Markdown",
    },
    {
      id: "designer-brief",
      icon: <RiLayoutGridLine size={20} />,
      title: "Designer brief",
      sub: "Figma-ready task list",
    },
    {
      id: "dev-tasks",
      icon: <RiCodeSSlashLine size={20} />,
      title: "Dev tasks",
      sub: "CSS values + text changes",
    },
    {
      id: "notion-slack",
      icon: <RiNotification4Line size={20} />,
      title: "Notion / Slack",
      sub: "Formatted for sharing",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 p-5 md:grid-cols-4 md:p-6">
      {CARDS.map((card) => (
        <ExportCard
          key={card.id}
          icon={card.icon}
          title={card.title}
          sub={card.sub}
          cardId={card.id}
          activeToast={activeToast}
          onClick={copyToClipboard}
        />
      ))}
    </div>
  );
}
