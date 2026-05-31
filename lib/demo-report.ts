import type { AuditReport } from "@/lib/audit-report";

export const DEMO_REPORT_ID = "29e49814-abac-4211-a226-a05dae07a710";

export const DEMO_REPORT_URL = "https://stripe.com";

export const DEMO_REPORT_PATH = `/report/${DEMO_REPORT_ID}`;

export const DEMO_REPORT = {
  url: DEMO_REPORT_URL,
  score: 76,
  risk: "medium",
  summary:
    "Stripe reads as credible and mature, but the hero leads with category language instead of a concrete first outcome, so evaluators need extra scrolling to understand fit.",
  verdict: "Strong trust signals with moderate hero clarity friction",
  key_observation:
    "Get started and Contact sales compete above the fold before users know which path matches their stage.",
  confidence: 86,
  generatedAt: "2025-05-19T12:00:00.000Z",
  breakdown: {
    clarity: 71,
    trust: 84,
    conversion: 69,
    navigation: 80,
    visuals: 82,
  },
  issues: [
    {
      category: "Clarity",
      title:
        "The hero headline says 'Financial infrastructure' without naming payments, billing, or issuing in one line, so new visitors can't quickly map Stripe to their job.",
      bullets: ["Broad category", "Hero copy", "First scan"],
      why: "When the category is abstract, evaluators bounce to compare simpler alternatives before exploring product tiles.",
      impact_metric_1: "clarity",
      impact_value_1: -16,
      impact_metric_2: "",
      impact_value_2: 0,
    },
    {
      category: "Conversion",
      title:
        "Get started, Contact sales, and Sign up with Google all compete above the fold, so users pause instead of choosing a clear next step.",
      bullets: ["Multiple CTAs", "Decision friction", "Hero actions"],
      why: "Parallel primary actions increase hesitation for teams that are still qualifying fit.",
      impact_metric_1: "conversion",
      impact_value_1: -18,
      impact_metric_2: "",
      impact_value_2: 0,
    },
    {
      category: "Trust",
      title:
        "Enterprise proof points sit lower on the page, so smaller teams may not see Fortune 100 adoption signals during the first screen.",
      bullets: ["Proof below fold", "Enterprise buyers", "Late validation"],
      why: "B2B buyers look for social proof early; missing it at the top slows commitment.",
      impact_metric_1: "trust",
      impact_value_1: -12,
      impact_metric_2: "",
      impact_value_2: 0,
    },
    {
      category: "Visuals",
      title:
        "The solutions grid gives similar weight to every product line, so nothing guides first-time visitors toward the one workflow they need most.",
      bullets: ["Flat hierarchy", "Product grid", "Mid-page"],
      why: "Equal visual priority makes scanning slower and pushes users to hunt for relevance.",
      impact_metric_1: "visuals",
      impact_value_1: -10,
      impact_metric_2: "",
      impact_value_2: 0,
    },
  ],
  suggestions: [
    {
      category: "Clarity",
      section: "Hero headline",
      recommendation:
        "Add a one-line qualifier under the headline: 'Payments, billing, and financial tools for internet businesses.'",
      why: "Concrete scope helps visitors self-qualify in the first screen.",
      priority: "quick_win",
    },
    {
      category: "Conversion",
      section: "Hero CTAs",
      recommendation:
        "Make Get started the single primary action and move Contact sales to a secondary text link.",
      why: "One obvious path reduces decision friction for first-time evaluators.",
      priority: "high_impact",
    },
    {
      category: "Trust",
      section: "Above the fold",
      recommendation:
        "Add a compact proof strip with $1.9T volume or Fortune 100 usage directly under the hero subhead.",
      why: "Early credibility increases willingness to explore deeper product sections.",
      priority: "medium_impact",
    },
  ],
  copy: [
    {
      section: "Hero headline",
      before: "Financial infrastructure to grow your revenue.",
      after:
        "Payments and financial tools to grow revenue — from first transaction to global scale.",
      why: "Names the core jobs so visitors understand fit immediately.",
      priority: "quick_win",
    },
    {
      section: "Primary CTA",
      before: "Get started",
      after: "Start accepting payments",
      why: "Signals a concrete first outcome instead of a generic signup.",
      priority: "quick_win",
    },
    {
      section: "Hero subhead",
      before:
        "Accept payments, offer financial services, and implement custom revenue models—from your first transaction to your billionth.",
      after:
        "Run payments, billing, and payouts in one platform — built for startups, platforms, and enterprises.",
      why: "Balances breadth with audience clarity in one scan.",
      priority: "medium_impact",
    },
  ],
} satisfies AuditReport;

export function getDemoReportJson(): string {
  return JSON.stringify(DEMO_REPORT);
}
