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
      "text": "The headline doesn't specify who the product is for.",
      "status": "missing",
      "link_to": "copy-headline",
      "category": "copy",
      "gap_label": "Audience unclear"
    },
    {
      "id": "cta-trial",
      "text": "The CTA does not clearly convey the trial's duration or benefits.",
      "status": "missing",
      "link_to": "copy-cta",
      "category": "copy",
      "gap_label": "Trial unclear"
    },
    {
      "id": "trust",
      "text": "No customer testimonials or logos to build credibility.",
      "status": "missing",
      "link_to": "trust",
      "category": "trust",
      "gap_label": "Trust signals missing"
    },
    {
      "id": "subheadline-clarity",
      "text": "Subheadline typography too light to scan quickly",
      "status": "weak",
      "link_to": "visual-fixes",
      "category": "visual",
      "gap_label": "Weak typography"
    },
    {
      "id": "features-clarity",
      "text": "Feature descriptions lack specific benefits for users.",
      "status": "pass",
      "link_to": null,
      "category": "copy",
      "gap_label": "Features vague"
    },
    {
      "id": "footer-structure",
      "text": "Footer contains clear navigation links for further exploration.",
      "status": "pass",
      "link_to": null,
      "category": "structure",
      "gap_label": "Footer links clear"
    },
    {
      "id": "visuals-clarity",
      "text": "Visual layout effectively highlights key elements above the fold.",
      "status": "pass",
      "link_to": null,
      "category": "visual",
      "gap_label": "Visual hierarchy strong"
    },
    {
      "id": "cta-visibility",
      "text": "Single CTA button is clearly visible and actionable.",
      "status": "pass",
      "link_to": null,
      "category": "structure",
      "gap_label": "CTA prominent"
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
          "text": "Start your 14-day free trial now",
          "label": "Trial clarity"
        },
        {
          "text": "Unlock your free trial today",
          "label": "Action-oriented"
        },
        {
          "text": "Claim your free trial instantly",
          "label": "Urgency"
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
          "text": "Boost team productivity with our intuitive CRM solution.",
          "label": "Outcome + audience"
        }
      ]
    },
    "subheadline": {
      "current": "folk CRM captures the full context of your relationships in one beautifully simple CRM.",
      "variants": [
        {
          "text": "Experience seamless relationship management with folk.",
          "label": "Value proposition"
        },
        {
          "text": "Your relationships, simplified and automated.",
          "label": "Simplification"
        },
        {
          "text": "Automate busywork and focus on what matters.",
          "label": "Efficiency focus"
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
  "previewImage": "/demo/folk-preview.jpg"
} satisfies AuditReport;

export function getDemoReportJson(): string {
  return JSON.stringify(DEMO_REPORT);
}
