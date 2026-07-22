import type { AuditReport } from "@/lib/audit-report";
import { buildReportSlug } from "@/lib/report-slug";

/** Matches live folk.app audit at /report/folk-k5qz (July 2026 model). */
export const DEMO_REPORT_ID = "k5qz8f2a1b0";

export const DEMO_REPORT_URL = "https://folk.app/";

export const DEMO_REPORT_SLUG = buildReportSlug(DEMO_REPORT_ID, DEMO_REPORT_URL);

export const DEMO_REPORT_PATH = `/report/${DEMO_REPORT_SLUG}`;

export const DEMO_REPORT_PREVIEW_IMAGE = "/demo/folk-preview.jpg";

export const DEMO_REPORT = {
  url: "https://folk.app/",
  copy: [] as AuditReport["copy"],
  meta: {
    proof_suggestion: "Trusted by 5,000+ teams worldwide",
    title_suggestion: "folk CRM — AI-powered relationships for your team",
    description_suggestion:
      "folk CRM captures every contact, email, and deal in one place. AI Assistants do the busywork so your team can focus on closing. Join 5,000+ teams. Free trial.",
  },
  risk: "medium",
  score: 6.1,
  issues: [] as AuditReport["issues"],
  summary:
    "folk's landing page carries strong fundamentals: clear headline, above-fold social proof from 5,000 users, and a defined value proposition. But the primary CTA doesn't signal a trial or next step, which suppresses signup conversion. Hidden pricing adds friction for B2B evaluators. Fixing the CTA alone could recover most of the estimated score gap.",
  verdict: "CTA mismatch dilutes primary conversion intent",
  key_observation:
    "The hero CTA reads 'Start for free' without trial length or next-step clarity, while pricing stays in nav only. B2B evaluators can't self-qualify before clicking.",
  breakdown: {
    trust: 80,
    clarity: 55,
    visuals: 75,
    friction: 55,
  },
  checklist: [
    {
      id: "finding-0",
      text: "Primary CTA doesn't clarify what 'free' means",
      evidence: "CTA text: 'Start for free'",
      body: "The above-fold CTA reads 'Start for free' with no trial length, no credit-card note, and no hint of what happens after the click. Visitors must infer whether they are signing up for a time-limited trial, a freemium tier, or a sales call.",
      why_it_matters_here:
        "B2B visitors with purchase intent abandon when the primary action doesn't match their goal.",
      fix: "Replace the hero CTA with 'Start your free trial' linked directly to the signup flow.",
      status: "missing",
      link_to: "copy-cta",
      category: "copy",
      gap_label: "Trial unclear",
      impact_score: 88,
      delta: 0.8,
    },
    {
      id: "finding-1",
      text: "Pricing hidden behind navigation click",
      evidence: "pricingVisible: false; pricingAboveFold: false",
      body: "Pricing is listed in the nav but absent from the page body, forcing evaluation-stage B2B buyers to leave the conversion flow before they can self-qualify.",
      why_it_matters_here:
        "B2B buyers who can't find pricing self-disqualify early, suppressing demo and trial requests.",
      fix: "Add a condensed pricing tier summary or 'Plans start at $X/user/mo' anchor above the footer CTA.",
      status: "missing",
      link_to: "structure-nav",
      category: "structure",
      gap_label: "Pricing hidden",
      impact_score: 72,
      delta: 0.6,
    },
    {
      id: "finding-2",
      text: "Subheadline truncated mid-sentence in extraction",
      evidence: "sub_text ends: '…learn from this da'",
      body: "The subheadline text ends abruptly, suggesting a render or truncation issue that breaks the value proposition before the AI differentiator lands.",
      why_it_matters_here:
        "An incomplete sentence undermines credibility and leaves the AI differentiator unexplained for first-time visitors.",
      fix: "Audit the subheadline render across viewports and ensure the full sentence displays without clipping.",
      status: "weak",
      link_to: "copy-headline",
      category: "copy",
      gap_label: "Subheadline clipped",
      impact_score: 65,
      delta: 0.5,
    },
  ],
  confidence: 88,
  generatedAt: "2026-07-22T09:05:53.870Z",
  suggestions: [] as AuditReport["suggestions"],
  copy_variants: {
    cta: {
      current: "Start for free",
      variants: [
        {
          text: "Start your free trial, no credit card needed",
          label: "Trial-focused primary CTA",
          recommended: true,
          rationale:
            "Names the offer explicitly and lowers perceived commitment at the exact moment of decision.",
        },
      ],
    },
    headline: {
      current: "The CRM that works for your team",
      variants: [
        {
          text: "Close more deals without the CRM busywork",
          label: "Outcome-led team headline",
          recommended: true,
          rationale:
            "Names the outcome (more deals) and removes the friction narrative (busywork), directly matching B2B evaluator intent.",
        },
      ],
    },
    subheadline: {
      current:
        "folk CRM captures the full context of your relationships in one beautifully simple CRM. AI Assistants learn from this da",
      variants: [
        {
          text: "folk captures every relationship's full context (emails, notes, deals), then AI Assistants surface what to do next, so your team spends time selling, not logging.",
          label: "AI + relationship context value prop",
          recommended: true,
          rationale:
            "Completes the AI value story, names concrete data types, and ends on a benefit for the buyer's team.",
        },
      ],
    },
  },
  score_potential: {
    chips: [
      { delta: "+0.8", label: "CTA trial unclear" },
      { delta: "+0.6", label: "Pricing hidden" },
      { delta: "+0.5", label: "Subheadline clipped" },
    ],
    target: 8.3,
  },
  visual_fixes: [
    {
      dimension: "cta_hierarchy",
      impact: "high",
      element: "Hero primary CTA button",
      observation:
        "The hero CTA lacks trial length and next-step clarity, sitting above the fold without reducing commitment anxiety.",
      recommendation:
        "Replace with a high-contrast trial signup button and add a one-line reassurance beneath it.",
    },
    {
      dimension: "social_proof",
      impact: "medium",
      element: "Trusted-by count + rating display",
      observation:
        "Social proof (5,000 users, rating reviews) is above fold but no named logos or pull-quotes.",
      recommendation:
        "Add 3–5 recognizable company logos or a pull-quote directly beneath the hero headline.",
    },
    {
      dimension: "navigation",
      impact: "medium",
      element: "Header navigation",
      observation: "Pricing lives in nav only—absent from the page body for evaluators.",
      recommendation: "Add sticky nav with primary CTA button visible at all scroll depths.",
    },
    {
      dimension: "headline_formula",
      impact: "low",
      element: "Hero headline",
      observation: "Headline names team but not a specific use case in the first line.",
      recommendation: "Add an audience qualifier or use case in the first line of the hero headline.",
    },
  ],
  visual_passes: [] as AuditReport["visual_passes"],
  previewImage: DEMO_REPORT_PREVIEW_IMAGE,
} satisfies AuditReport;

export function getDemoReportJson(): string {
  return JSON.stringify(DEMO_REPORT);
}
