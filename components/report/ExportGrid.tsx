"use client";

import { useState, useCallback } from "react";
import {
  RiFileTextLine,
  RiLayoutGridLine,
  RiCodeSSlashLine,
  RiNotification4Line,
  RiCheckLine,
} from "@remixicon/react";
import type { ReportChecklistItem, ReportCopyVariants, ReportMeta } from "@/lib/audit-report";

// ---------------------------------------------------------------------------
// Design tokens (docs/report-mvp-v4.html §7 EXPORT)
// --bc:#fff  --bs:#F5F5F3  --b1:rgba(0,0,0,.07)  --b2:rgba(0,0,0,.11)
// --t1:#111  --t2:#555  --t3:#999  --rsm:10px
// ---------------------------------------------------------------------------

interface ExportGridProps {
  copyVariants: ReportCopyVariants;
  meta: ReportMeta;
  checklist?: ReportChecklistItem[];
}

type CardId = "copy-deck" | "designer-brief" | "dev-tasks" | "notion-slack";

// ---------------------------------------------------------------------------
// Markdown builders
// ---------------------------------------------------------------------------

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
  meta: ReportMeta
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

  return [
    "# Designer Brief",
    "",
    "## Copy updates",
    ...copyLines,
    "",
    "## Meta updates",
    `- **Page title:** ${meta.title_suggestion}`,
    `- **Meta description:** ${meta.description_suggestion}`,
  ].join("\n");
}

function buildDevTasksMarkdown(
  variants: ReportCopyVariants,
  meta: ReportMeta,
  checklist?: ReportChecklistItem[]
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

  const visualGap = checklist?.find(
    (item) => item.link_to === "visual-fixes" && item.status === "weak"
  );
  const visualLines = visualGap
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

// ---------------------------------------------------------------------------
// Card component
// ---------------------------------------------------------------------------

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
      className="group relative w-full text-left bg-[#F5F5F3] rounded-[10px] p-[14px] cursor-pointer border border-transparent transition-all duration-[120ms] hover:bg-white hover:border-[rgba(0,0,0,0.11)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111]/20"
    >
      <div className="text-[20px] text-[#999] mb-2 leading-none">
        {icon}
      </div>
      <div className="text-[13px] font-medium text-[#111] mb-[3px]">{title}</div>
      <div className="text-[12px] text-[#999] leading-[1.4]">{sub}</div>

      {/* Toast overlay */}
      {copied && (
        <span className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-[10px] bg-[#111]/90 text-[12px] font-medium text-white pointer-events-none">
          <RiCheckLine size={14} />
          Copied!
        </span>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ExportGrid({ copyVariants, meta, checklist }: ExportGridProps) {
  const [activeToast, setActiveToast] = useState<CardId | null>(null);

  const copyToClipboard = useCallback(
    async (id: CardId) => {
      let text = "";

      switch (id) {
        case "copy-deck":
          text = buildCopyDeckMarkdown(copyVariants);
          break;
        case "designer-brief":
          text = buildDesignerBriefMarkdown(copyVariants, meta);
          break;
        case "dev-tasks":
          text = buildDevTasksMarkdown(copyVariants, meta, checklist);
          break;
        case "notion-slack":
          text = buildNotionSlackMarkdown(copyVariants, meta);
          break;
      }

      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // fallback for older browsers
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
    [copyVariants, meta, checklist]
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
    <div className="grid grid-cols-2 gap-2 px-5 pb-4 sm:grid-cols-4">
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
