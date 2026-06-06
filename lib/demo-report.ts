import type { AuditReport } from "@/lib/audit-report";

export const DEMO_REPORT_ID = "x4pxi2jb2o";

export const DEMO_REPORT_URL = "https://zapier.com";

export const DEMO_REPORT_PATH = `/report/${DEMO_REPORT_ID}`;

export const DEMO_REPORT_PREVIEW_IMAGE = "/demo/zapier-preview.jpg";

export const DEMO_REPORT = {
  url: DEMO_REPORT_URL,
  previewImage: DEMO_REPORT_PREVIEW_IMAGE,
  score: 65,
  risk: "medium",
  summary:
    "Visitors can't tell who the product is for or what they'll get in the first few seconds.",
  verdict: "Headline unclear about AI automation benefits for users.",
  key_observation:
    "Without a named audience in the hero, new visitors struggle to judge fit before scrolling.",
  confidence: 85,
  generatedAt: "2026-05-31T18:14:21.738Z",
  breakdown: {
    clarity: 65,
    trust: 65,
    conversion: 55,
    navigation: 70,
    visuals: 60,
  },
  issues: [
    {
      category: "Clarity",
      title:
        "The hero headline does not specify who the AI tools are for, making it unclear if it fits the visitor's needs.",
      bullets: ["Low clarity"],
      why: "Visitors cannot quickly determine if the product addresses their specific problems, reducing engagement.",
      impact_metric_1: "clarity",
      impact_value_1: -20,
      impact_metric_2: "",
      impact_value_2: 0,
    },
    {
      category: "Conversion",
      title:
        "The primary CTA 'Start free with email' lacks context about what the user will get or do next.",
      bullets: ["Weak CTA"],
      why: "Uncertain expectations can lead to hesitation or abandonment before signing up.",
      impact_metric_1: "cta",
      impact_value_1: -15,
      impact_metric_2: "",
      impact_value_2: 0,
    },
    {
      category: "Trust",
      title:
        "The trust signals (agent counts, app integrations, calls) are presented without context or explanation.",
      bullets: ["Missing trust signals"],
      why: "Lack of context makes these signals less credible and less impactful for new visitors.",
      impact_metric_1: "trust",
      impact_value_1: -18,
      impact_metric_2: "",
      impact_value_2: 0,
    },
    {
      category: "Visuals",
      title:
        "The icons representing AI tools are generic and do not visually communicate specific benefits or features.",
      bullets: ["Weak hierarchy"],
      why: "Icons do not enhance understanding or guide users toward desired actions effectively.",
      impact_metric_1: "visuals",
      impact_value_1: -12,
      impact_metric_2: "",
      impact_value_2: 0,
    },
  ],
  suggestions: [
    {
      category: "Clarity",
      section: "Hero headline and subtext",
      recommendation:
        "Specify the target user and core AI automation benefit in the headline.",
      why: "Clear messaging immediately communicates relevance, increasing engagement.",
      priority: "high_impact",
    },
    {
      category: "Conversion",
      section: "Primary CTA button",
      recommendation:
        "Add a descriptive subtext to the CTA explaining what signing up offers.",
      why: "Clarifies user expectations, reducing hesitation and increasing sign-ups.",
      priority: "high_impact",
    },
    {
      category: "Trust",
      section: "Trust signals area",
      recommendation:
        "Include brief explanations or context for agent counts and integrations.",
      why: "Enhances credibility and reassures visitors about product reliability.",
      priority: "medium_impact",
    },
  ],
  brand_stage: "established",
  headline_directions: {
    before: "Your tools. Your rules. Any AI.",
    gap: "The line sounds catchy but never says who it's for or what changes for them.",
    context:
      "Zapier is widely known — visitors already understand the category. Headlines can lean into bold claims and outcomes instead of re-explaining automation.",
    options: [
      {
        label: "Bold / brand-led",
        text: "Your rules. Every model. One AI workspace.",
      },
      {
        label: "Outcome-led",
        text: "Ship AI workflows faster — without the tool chaos.",
      },
      {
        label: "Positioning-led",
        text: "Stop duct-taping models across a dozen disconnected tools.",
      },
    ],
  },
  copy: [
    {
      section: "Hero headline",
      before: "Your tools. Your rules. Any AI.",
      after: "AI automation tools designed for marketing teams to streamline workflows.",
      why: "Specifies the target audience and core benefit, improving clarity.",
      priority: "high_impact",
    },
    {
      section: "Subtext",
      before:
        "Zapier gives teams one place to set guardrails, manage model access, and see everything — so everyone can build AI confidently, on any model, without waiting for permission.",
      after:
        "Manage AI workflows and permissions easily, empowering your team to build with confidence.",
      why: "Simplifies and clarifies the value proposition for target users.",
      priority: "medium_impact",
    },
    {
      section: "CTA button",
      before: "Start free with email",
      after: "Get started with a free AI automation trial",
      why: "Provides clarity on what the user will receive and the action's benefit.",
      priority: "quick_win",
    },
  ],
} satisfies AuditReport;

export function getDemoReportJson(): string {
  return JSON.stringify(DEMO_REPORT);
}
