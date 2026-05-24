export const DEMO_REPORT_ID = "29e49814-abac-4211-a226-a05dae07a710";

export const DEMO_REPORT = {
  url: "https://www.notion.so",
  score: 72,
  risk: "medium",
  summary:
    "The page looks polished, but the hero never states the primary job-to-be-done, so new visitors struggle to judge fit before scrolling.",
  verdict: "Strong polish with moderate conversion friction",
  key_observation:
    "The main CTA invites signup before explaining what gets created in the first minute.",
  confidence: 84,
  generatedAt: "2025-05-19T12:00:00.000Z",
  breakdown: {
    clarity: 68,
    trust: 74,
    conversion: 63,
    navigation: 78,
    visuals: 81,
  },
  issues: [
    {
      category: "Conversion",
      title:
        "The hero CTA says 'Get Notion free' without showing what gets created first, so visitors hesitate before signup.",
      bullets: ["Generic CTA", "Missing first step", "Above the fold"],
      why: "When the next action is unclear, users leave to compare alternatives instead of starting setup.",
      impact_metric_1: "conversion",
      impact_value_1: -18,
      impact_metric_2: "clarity",
      impact_value_2: -12,
    },
    {
      category: "Clarity",
      title:
        "The headline focuses on 'workspace' without naming the core outcome, so teams can't tell if Notion replaces docs, wikis, or project tools.",
      bullets: ["Broad positioning", "Ambiguous value", "Hero copy"],
      why: "Unclear category fit increases bounce rates from evaluators with a specific use case in mind.",
      impact_metric_1: "clarity",
      impact_value_1: -15,
      impact_metric_2: "conversion",
      impact_value_2: -10,
    },
    {
      category: "Trust",
      title:
        "Social proof logos appear below the fold, so first-time visitors don't see credible adoption signals during the initial scan.",
      bullets: ["Trust below fold", "Late proof", "Enterprise buyers"],
      why: "B2B buyers look for validation early; missing proof at the top weakens confidence in the trial.",
      impact_metric_1: "trust",
      impact_value_1: -14,
      impact_metric_2: "",
      impact_value_2: 0,
    },
    {
      category: "Visuals",
      title:
        "Feature tiles use similar visual weight, so nothing guides the eye toward the highest-value workflow for new users.",
      bullets: ["Flat hierarchy", "Equal cards", "Mid-page"],
      why: "When every block competes for attention, users read less and miss the path to activation.",
      impact_metric_1: "visuals",
      impact_value_1: -11,
      impact_metric_2: "conversion",
      impact_value_2: -8,
    },
  ],
  suggestions: [
    {
      category: "Conversion",
      section: "Hero CTA",
      recommendation:
        "Pair the primary button with a one-line outcome, e.g. 'Start a doc, wiki, or project in under 2 minutes.'",
      why: "Specific first steps reduce signup anxiety and improve trial starts.",
      impact_metric_1: "conversion",
      impact_value_1: 14,
      impact_metric_2: "clarity",
      impact_value_2: 10,
    },
    {
      category: "Clarity",
      section: "Hero headline",
      recommendation:
        "Lead with the job: 'Write, plan, and organize in one connected workspace.'",
      why: "Outcome-first copy helps visitors self-qualify faster.",
      impact_metric_1: "clarity",
      impact_value_1: 12,
      impact_metric_2: "",
      impact_value_2: 0,
    },
    {
      category: "Trust",
      section: "Above the fold",
      recommendation:
        "Add a compact logo strip or customer count directly under the hero subhead.",
      why: "Early proof increases trust before users commit attention to feature details.",
      impact_metric_1: "trust",
      impact_value_1: 11,
      impact_metric_2: "conversion",
      impact_value_2: 9,
    },
  ],
  copy: [
    {
      section: "Hero headline",
      before: "One workspace. Every team.",
      after: "Write, plan, and organize every team workflow in one workspace.",
      why: "Names concrete jobs so visitors understand fit immediately.",
      impact_metric_1: "clarity",
      impact_value_1: 13,
      impact_metric_2: "conversion",
      impact_value_2: 8,
    },
    {
      section: "Primary CTA",
      before: "Get Notion free",
      after: "Start your workspace — free",
      why: "Signals a low-friction first step instead of an abstract signup.",
      impact_metric_1: "conversion",
      impact_value_1: 12,
      impact_metric_2: "",
      impact_value_2: 0,
    },
    {
      section: "Subheadline",
      before: "Where your teams and docs come together.",
      after: "Docs, wikis, and projects in one place — built for teams that move fast.",
      why: "Spells out deliverables and audience in one scan.",
      impact_metric_1: "clarity",
      impact_value_1: 10,
      impact_metric_2: "trust",
      impact_value_2: 7,
    },
  ],
} as const;

export function getDemoReportJson(): string {
  return JSON.stringify(DEMO_REPORT);
}
