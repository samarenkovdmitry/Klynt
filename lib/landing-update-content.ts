import {
  RiAdvertisementLine,
  RiBarChartBoxLine,
  RiDashboard3Line,
  RiFilePdfLine,
  RiFlagLine,
  RiImageAddLine,
  RiLightbulbLine,
  RiPieChart2Line,
  RiQuillPenLine,
  RiSearchEyeLine,
  RiSparkling2Line,
} from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";

export const TEST_CONTAINER = "mx-auto w-full max-w-[1040px]";
export const LANDING_UPDATE_CONTAINER = TEST_CONTAINER;

export type AnalyzeItem = {
  icon: RemixiconComponentType;
  title: string;
  description: string;
};

export type ProcessStep = {
  title: string;
  description: string;
  bullets: { icon: RemixiconComponentType; text: string }[];
};

export type WhatYouGetFeature = {
  id: string;
  icon: RemixiconComponentType;
  title: string;
  description: string;
};

export type InsideReportItem = {
  title: string;
  tags?: string[];
  impact: string;
  impactTone: "red" | "green" | "sky";
  footer: string;
  showSkeleton?: boolean;
  showComparison?: boolean;
};

export const ANALYZE_ITEMS: AnalyzeItem[] = [
  {
    icon: RiSearchEyeLine,
    title: "UX friction",
    description: "Detect confusing flows and interaction friction",
  },
  {
    icon: RiQuillPenLine,
    title: "Copy clarity",
    description: "Identify vague messaging and unclear positioning",
  },
  {
    icon: RiBarChartBoxLine,
    title: "Conversion blockers",
    description: "Surface issues reducing trust and action",
  },
  {
    icon: RiSparkling2Line,
    title: "Prioritized fixes",
    description: "Get actionable improvements ranked by impact",
  },
];

export const PROCESS_STEPS: ProcessStep[] = [
  {
    title: "Paste your URL",
    description: "Any live landing page. No install, no account.",
    bullets: [
      {
        icon: RiAdvertisementLine,
        text: "Works on marketing sites and product pages",
      },
      {
        icon: RiImageAddLine,
        text: "Captures UI and copy as users see it",
      },
    ],
  },
  {
    title: "AI scans the page",
    description:
      "Hierarchy, messaging, trust, and conversion patterns — in one pass.",
    bullets: [
      { icon: RiFlagLine, text: "Flags friction across the full page" },
      {
        icon: RiDashboard3Line,
        text: "Scores clarity, trust, and conversion",
      },
    ],
  },
  {
    title: "Review your report",
    description: "Issues, priorities, and copy rewrites — ready to share.",
    bullets: [
      { icon: RiPieChart2Line, text: "Prioritized recommendations" },
      { icon: RiFilePdfLine, text: "Export as PDF" },
    ],
  },
];

export const WHAT_YOU_GET_FEATURES: WhatYouGetFeature[] = [
  {
    id: "ux-diagnostics",
    icon: RiSearchEyeLine,
    title: "UX diagnostics",
    description: "Spot layout, navigation, and trust friction fast.",
  },
  {
    id: "prioritized-fixes",
    icon: RiLightbulbLine,
    title: "Prioritized fixes",
    description: "Know what to change first — with impact estimates.",
  },
  {
    id: "copy-rewrites",
    icon: RiQuillPenLine,
    title: "Copy rewrites",
    description: "Before/after suggestions tied to real sections.",
  },
  {
    id: "pdf-export",
    icon: RiFilePdfLine,
    title: "PDF export",
    description: "Share findings with design, product, or clients.",
  },
];

export const INSIDE_REPORT_ITEMS: InsideReportItem[] = [
  {
    title: "Enterprise proof points sit lower on the page",
    tags: ["Proof below fold", "Late validation"],
    impact: "-10% trust",
    impactTone: "red",
    footer: "Why it matters",
  },
  {
    title: "Hero Section",
    impact: "+20% conversion",
    impactTone: "green",
    footer: "Why it works",
    showSkeleton: true,
  },
  {
    title: "Hero Headline",
    impact: "+15% clarity",
    impactTone: "sky",
    footer: "",
    showComparison: true,
  },
];

export const INSIDE_REPORT_BEFORE =
  "Mac screensavers that keep your display alive.";
export const INSIDE_REPORT_AFTER =
  "Beautiful Mac screensavers that keep your screen alive.";
