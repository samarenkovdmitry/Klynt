import {
  RiBarChartBoxLine,
  RiFilePdfLine,
  RiLightbulbLine,
  RiQuillPenLine,
  RiSearchEyeLine,
  RiSparkling2Line,
  RiTeamLine,
} from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";

export const LANDING_UPDATE_CONTAINER = "mx-auto w-full max-w-[1040px]";

export type LensItem = {
  icon: RemixiconComponentType;
  title: string;
  description: string;
};

export type ProcessStep = {
  title: string;
  description: string;
  bullets: string[];
};

export type PlatformFeature = {
  icon: RemixiconComponentType;
  title: string;
  description: string;
};

export type ReportIssue = {
  title: string;
  tags: string[];
  impact?: string;
};

export const THREE_LENSES: LensItem[] = [
  {
    icon: RiSearchEyeLine,
    title: "UX Issues",
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
    icon: RiTeamLine,
    title: "Product teams",
    description: "Shareable reports for design and product",
  },
];

export const PROCESS_STEPS: ProcessStep[] = [
  {
    title: "Paste your URL",
    description: "Any live landing page. No install, no account.",
    bullets: [
      "Works on marketing sites and product pages",
      "Captures UI and copy as users see it",
    ],
  },
  {
    title: "AI scans the page",
    description:
      "Hierarchy, messaging, trust, and conversion patterns — in one pass.",
    bullets: [
      "Flags friction across the full page",
      "Scores clarity, trust, and conversion",
    ],
  },
  {
    title: "Review your report",
    description: "Issues, priorities, and copy rewrites — ready to share.",
    bullets: ["Export as PDF", "Shareable clarity report in under a minute"],
  },
];

export const PLATFORM_FEATURES: PlatformFeature[] = [
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

export const REPORT_ISSUES: ReportIssue[] = [
  {
    title: "Unclear primary CTA hierarchy",
    tags: ["Weak hierarchy", "Weak CTA"],
    impact: "-15% clarity",
  },
  {
    title: "Competing actions above the fold",
    tags: ["Conversion risk", "Navigation"],
    impact: "-10% conversion",
  },
  {
    title: "Hero headline lacks concrete outcome",
    tags: ["Copy refinement", "Hero section"],
    impact: "+15% clarity",
  },
];

export const REPORT_BEFORE = "Turn waiting into watching.";
export const REPORT_AFTER =
  "Beautiful Mac screensavers that keep your screen alive.";
