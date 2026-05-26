import {
  RiBarChartBoxLine,
  RiFilePdfLine,
  RiLightbulbLine,
  RiQuillPenLine,
  RiSearchEyeLine,
  RiSparkling2Line,
} from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";

export type TestStep = {
  title: string;
  description: string;
  bullets: string[];
};

export type TestPlatformFeature = {
  icon: RemixiconComponentType;
  title: string;
  description: string;
};

export type TestQuote = {
  quote: string;
  name: string;
  role: string;
  initials: string;
  avatarGradient: string;
};

export type TestStat = {
  value: string;
  label: string;
};

export const TEST_HOW_IT_WORKS_STEPS: TestStep[] = [
  {
    title: "Paste your URL",
    description: "Any live landing page. No install, no account.",
    bullets: ["Works on marketing sites and product pages", "Captures UI and copy as users see it"],
  },
  {
    title: "AI scans the page",
    description: "Hierarchy, messaging, trust, and conversion patterns — in one pass.",
    bullets: ["Flags friction across the full page", "Scores clarity, trust, and conversion"],
  },
  {
    title: "Review your report",
    description: "Issues, priorities, and copy rewrites — ready to share.",
    bullets: ["Export as PDF", "Shareable clarity report in under a minute"],
  },
];

export const TEST_PLATFORM_FEATURES: TestPlatformFeature[] = [
  {
    icon: RiSearchEyeLine,
    title: "UX diagnostics",
    description: "Spot layout, navigation, and trust friction fast.",
  },
  {
    icon: RiQuillPenLine,
    title: "Copy rewrites",
    description: "Before/after suggestions tied to real sections.",
  },
  {
    icon: RiLightbulbLine,
    title: "Prioritized fixes",
    description: "Know what to change first — with impact estimates.",
  },
  {
    icon: RiFilePdfLine,
    title: "PDF export",
    description: "Share findings with design, product, or clients.",
  },
];

export const TEST_REPORT_LENSES = [
  {
    icon: RiSearchEyeLine,
    label: "UX issues",
    description: "What slows users down",
  },
  {
    icon: RiSparkling2Line,
    label: "Improvements",
    description: "What to fix first",
  },
  {
    icon: RiBarChartBoxLine,
    label: "Copy refinement",
    description: "Sharper headlines and CTAs",
  },
] as const;

export const TEST_STATS: TestStat[] = [
  { value: "~20s", label: "Average report time" },
  { value: "3", label: "Report sections" },
  { value: "0", label: "Setup required" },
];

export const TEST_QUOTES: TestQuote[] = [
  {
    quote: "Caught weak CTA copy before launch.",
    name: "Maya Chen",
    role: "Product designer",
    initials: "MC",
    avatarGradient: "from-[#2563EB] to-[#1d4ed8]",
  },
  {
    quote: "Faster than a manual UX review.",
    name: "James Okonkwo",
    role: "Founder",
    initials: "JO",
    avatarGradient: "from-[#0E1B36] to-[#2563EB]",
  },
  {
    quote: "Clear priorities — not vague advice.",
    name: "Elena Ruiz",
    role: "Product manager",
    initials: "ER",
    avatarGradient: "from-[#10a6da] to-[#2563EB]",
  },
];
