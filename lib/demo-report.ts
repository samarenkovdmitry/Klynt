import type { AuditReport } from "@/lib/audit-report";
import { buildReportSlug } from "@/lib/report-slug";

export const DEMO_REPORT_ID = "kjnhvbk4df";

export const DEMO_REPORT_URL = "https://www.folk.app/";

export const DEMO_REPORT_SLUG = buildReportSlug(DEMO_REPORT_ID, DEMO_REPORT_URL);

export const DEMO_REPORT_PATH = `/report/${DEMO_REPORT_SLUG}`;

export const DEMO_REPORT_PREVIEW_IMAGE = "/demo/folk-preview.jpg";

export const DEMO_REPORT = {
  "url": "https://www.folk.app/",
  "copy": [] as AuditReport["copy"],
  "meta": {
    "trust_notes": [
      "Include testimonials to enhance credibility.",
      "Clarify the trial period to reduce perceived risk."
    ],
    "proof_suggestion": "Add customer logos below CTA",
    "title_suggestion": "Folk CRM: Simple CRM for Teams",
    "description_suggestion": "Folk is a simple CRM designed for teams to manage relationships effortlessly."
  },
  "risk": "medium",
  "score": 6.5,
  "issues": [] as AuditReport["issues"],
  "summary": "A visitor may feel uncertain about the product's specific benefits and who it serves. The messaging lacks clarity for new users unfamiliar…",
  "verdict": "Ambiguous audience targeting in headline",
  "breakdown": {
    "trust": 50,
    "clarity": 70,
    "visuals": 80,
    "friction": 60
  },
  "checklist": [
    {
      "id": "headline-category",
      "text": "Headline doesn't name a role, industry, or use-case.",
      "evidence": "'The CRM that works for your team' — no audience signal beyond 'team'; cold visitors can't self-qualify",
      "status": "missing",
      "link_to": "copy-headline",
      "category": "copy",
      "gap_label": "Audience unclear"
    },
    {
      "id": "cta-trial",
      "text": "CTA doesn't clarify what 'free' means — trial or freemium.",
      "evidence": "'Start for free' button has no duration, no plan mention, no outcome after click",
      "status": "missing",
      "link_to": "copy-cta",
      "category": "copy",
      "gap_label": "Trial unclear"
    },
    {
      "id": "trust",
      "text": "No logos, stats, or testimonials visible above the fold.",
      "evidence": "Hero section shows headline, subheadline, and CTA only — zero credibility signals above fold",
      "status": "missing",
      "link_to": "trust",
      "category": "trust",
      "gap_label": "Trust missing above fold"
    },
    {
      "id": "subheadline-clarity",
      "text": "Subheadline typography too light to scan quickly.",
      "evidence": "'folk CRM captures the full context of your relationships...' rendered in light gray weight — reads as caption",
      "status": "weak",
      "link_to": "visual-fixes",
      "category": "visual",
      "gap_label": "Weak typography"
    },
    {
      "id": "nav-structure",
      "text": "Header nav shows Product, Features, Pricing, Blog, Login.",
      "evidence": "Five top-level nav links visible in header — clear structure for warm traffic exploration",
      "status": "pass",
      "link_to": null,
      "category": "structure",
      "gap_label": "Nav clear"
    },
    {
      "id": "footer-structure",
      "text": "Footer contains Product, Company, and Resources columns.",
      "evidence": "Three-column footer with labelled link groups — supports deeper exploration and SEO",
      "status": "pass",
      "link_to": null,
      "category": "structure",
      "gap_label": "Footer links clear"
    },
    {
      "id": "visuals-clarity",
      "text": "Single primary CTA above fold — no competing hero buttons.",
      "evidence": "'Start for free' orange pill is the only hero CTA; no secondary button creates decision friction",
      "status": "pass",
      "link_to": null,
      "category": "visual",
      "gap_label": "CTA hierarchy clean"
    },
    {
      "id": "cta-visibility",
      "text": "Hero headline is large and immediately readable.",
      "evidence": "'The CRM that works for your team' in ~48px weight-700 — dominant above fold, no contrast issues",
      "status": "pass",
      "link_to": null,
      "category": "structure",
      "gap_label": "H1 prominent"
    }
  ],
  "confidence": 85,
  "brand_stage": "just_launched",
  "generatedAt": "2026-06-11T16:14:32.880Z",
  "suggestions": [] as AuditReport["suggestions"],
  "audience_type": "both",
  "copy_variants": {
    "cta": {
      "current": "Start for free",
      "variants": [
        {
          "text": "Start free trial",
          "label": "Trial explicit"
        },
        {
          "text": "Try it free",
          "label": "Risk-free"
        },
        {
          "text": "Get started free",
          "label": "Direct action"
        }
      ]
    },
    "headline": {
      "current": "The CRM that works for your team",
      "variants": [
        {
          "text": "CRM for teams that want simplicity and efficiency.",
          "label": "Category + audience"
        },
        {
          "text": "Tired of complex CRMs? Simplify your workflow with folk.",
          "label": "Problem + solution"
        },
        {
          "text": "Simple CRM for teams who outgrew spreadsheets.",
          "label": "Outcome + audience"
        }
      ]
    },
    "subheadline": {
      "current": "folk CRM captures the full context of your relationships in one beautifully simple CRM.",
      "variants": [
        {
          "text": "Manage every relationship in one simple CRM — free 14-day trial.",
          "label": "Value proposition"
        },
        {
          "text": "Full relationship context in one place, built for growing teams.",
          "label": "Specificity"
        },
        {
          "text": "Less busywork, more time on the relationships that matter.",
          "label": "Outcome"
        }
      ]
    }
  },
  "traffic_source": "mixed",
  "key_observation": "Audience split — works for warm or cold traffic only",
  "score_potential": {
    "chips": [
      {
        "delta": "+0.5",
        "label": "Audience unclear"
      },
      {
        "delta": "+0.5",
        "label": "Trial unclear"
      },
      {
        "delta": "+0.5",
        "label": "Trust signals missing"
      }
    ],
    "target": 8
  },
  "visual_fixes": [
    {
      "dimension": "typography",
      "observation": "Subheadline weight is light — reads as caption, not value prop",
      "recommendation": "Increase subheadline to 18px / weight 500 for faster scan"
    },
    {
      "dimension": "border_radius",
      "observation": "Large rounded cards signal consumer-playful, not team CRM",
      "recommendation": "Tighten card and button radius to 6–8px for B2B credibility"
    },
    {
      "dimension": "depth",
      "observation": "Flat white hero — page feels unfinished, low premium signal",
      "recommendation": "Add subtle #F8F8F6 section tint or light gradient behind hero"
    }
  ],
  "visual_passes": [
    {
      "dimension": "cta_hierarchy",
      "note": "Single primary CTA dominates — clear next step above fold"
    },
    {
      "dimension": "spacing",
      "note": "Hero breathing room supports scan for mixed traffic"
    }
  ],
  "previewImage": "/demo/folk-preview.jpg"
} satisfies AuditReport;

export function getDemoReportJson(): string {
  return JSON.stringify(DEMO_REPORT);
}
