import {
  RiBarChartBoxLine,
  RiSearchEyeLine,
  RiShieldCheckLine,
  RiSparkling2Line,
} from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";

export type MockupHighlight = {
  icon: RemixiconComponentType;
  title: string;
  description: string;
};

export type HowItWorksStep = {
  title: string;
  description: string;
};

export type BentoVariant = "red" | "emerald" | "sky";

export type AnalysisBentoCard = {
  id: string;
  variant: BentoVariant;
  pillLabel: string;
  title: string;
  description: string;
  bordered?: boolean;
};

export const MOCKUP_HIGHLIGHTS: MockupHighlight[] = [
  {
    icon: RiSearchEyeLine,
    title: "UX issues",
    description: "Blocks with estimated impact on clarity",
  },
  {
    icon: RiSparkling2Line,
    title: "Copy refinements",
    description: "Before / after text suggestions in context",
  },
  {
    icon: RiBarChartBoxLine,
    title: "Conversion insights",
    description: "Clear scores with practical next steps",
  },
  {
    icon: RiShieldCheckLine,
    title: "Clarity score",
    description: "One number to track page quality",
  },
];

export const SOCIAL_PROOF_AVATARS = [
  "/avatars/user1.png",
  "/avatars/user2.png",
  "/avatars/user3.png",
];

export const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    title: "Paste your URL",
    description:
      "Enter any live landing page or marketing site. Klynt captures the visible UI and copy — no install or account needed.",
  },
  {
    title: "AI scans the page",
    description:
      "The model reviews hierarchy, messaging, trust signals, and conversion patterns to spot friction across the full page.",
  },
  {
    title: "Review your report",
    description:
      "Get UX issues, prioritized improvements, and copy rewrites in one shareable clarity report — ready to export as PDF.",
  },
];

export const ANALYSIS_BENTO_CARDS: AnalysisBentoCard[] = [
  {
    id: "ux-issues",
    variant: "red",
    pillLabel: "UX Issues",
    title: "See what slows users down",
    description:
      "Klynt flags problems in hierarchy, navigation, trust, and conversion — each with a short explanation of why it matters for your specific page.",
  },
  {
    id: "improvements",
    variant: "emerald",
    pillLabel: "Improvements",
    title: "Know what to fix first",
    description:
      "Get prioritized recommendations tied to real sections of your UI — layout, CTA placement, trust blocks — with estimated impact on clarity and conversion.",
    bordered: true,
  },
  {
    id: "copy-refinement",
    variant: "sky",
    pillLabel: "Copy Refinement",
    title: "Rewrite vague copy",
    description:
      "Headlines, CTAs, and section text get before/after suggestions that explain what you sell, who it's for, and what to do next — without generic marketing fluff.",
    bordered: true,
  },
];
