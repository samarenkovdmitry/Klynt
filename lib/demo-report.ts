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
  "summary": "A first-time visitor reads a polished team-CRM pitch and feels mildly interested but not yet ready to commit, because the page offers no customer logos, user counts, or testimonials to validate that real teams have already made this switch — and without that third-party confirmation, the generic headline and vague \"Start for free\" CTA read as marketing rather than an established product.",
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
      "body": "The hero headline speaks to 'your team' without naming who that team is — sales, recruiting, agencies, or founders. A first-time visitor comparing CRMs cannot tell in the first three seconds whether folk is built for them or for everyone.",
      "why_it_matters_here": "Cold traffic from search or ads has no prior context — vague audience framing makes folk feel like one of many generic CRMs.",
      "fix": "Name a specific audience or use case in the headline, e.g. 'Simple CRM for teams who outgrew spreadsheets.'",
      "status": "missing",
      "link_to": "copy-headline",
      "category": "copy",
      "gap_label": "Audience unclear",
      "impact_score": 88,
      "delta": 0.5
    },
    {
      "id": "cta-trial",
      "text": "CTA doesn't clarify what 'free' means — trial or freemium.",
      "evidence": "'Start for free' button has no duration, no plan mention, no outcome after click",
      "body": "The primary CTA says 'Start for free' with no trial length, no credit-card note, and no hint of what happens after the click. Visitors must infer whether they are signing up for a time-limited trial, a freemium tier, or a sales call.",
      "why_it_matters_here": "Ambiguous CTAs raise perceived commitment at the exact moment of decision — especially for cold visitors evaluating multiple tools.",
      "fix": "Change the button to 'Start free 14-day trial' or add a one-line reassurance directly beneath it.",
      "status": "missing",
      "link_to": "copy-cta",
      "category": "copy",
      "gap_label": "Trial unclear",
      "impact_score": 76,
      "delta": 0.5
    },
    {
      "id": "trust",
      "text": "No logos, stats, or testimonials visible above the fold.",
      "evidence": "Hero section shows headline, subheadline, and CTA only — zero credibility signals above fold",
      "body": "The hero presents product claims without any third-party validation — no customer logos, user counts, ratings, or testimonials within the first screen. A visitor evaluating a CRM switch has nothing to corroborate that real teams already rely on folk.",
      "why_it_matters_here": "For a just-launched brand, unverified claims read as marketing — peer proof is what converts skeptical first-time visitors.",
      "fix": "Add 3–5 customer logos or one concrete stat (e.g. 'Used by 3,000+ teams') directly below the hero CTA.",
      "status": "missing",
      "link_to": "trust",
      "category": "trust",
      "gap_label": "Trust missing above fold",
      "impact_score": 72,
      "delta": 0.5
    },
    {
      "id": "subheadline-clarity",
      "text": "Subheadline typography too light to scan quickly.",
      "evidence": "'folk CRM captures the full context of your relationships...' rendered in light gray weight — reads as caption",
      "body": "The subheadline uses a lighter weight and lower contrast than the headline, so it reads as supporting caption text rather than a scannable value statement. On a quick scroll, visitors may skip the line that explains what folk actually does.",
      "why_it_matters_here": "When the headline is generic, the subheadline must carry the product definition — weak typography makes that job harder.",
      "fix": "Increase subheadline font weight to medium and darken the color so it scans at the same priority as the headline.",
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
          "label": "Trial explicit",
          "recommended": true,
          "rationale":
            "Names the offer explicitly — a trial — so visitors know what happens after the click instead of guessing whether “free” means a demo, freemium, or time-limited access.",
        },
        {
          "text": "Try it free",
          "label": "Risk-free",
          "rationale":
            "Softens commitment with “try,” but leaves trial length and next steps unstated — weaker for cold traffic evaluating multiple CRMs.",
        },
        {
          "text": "Get started free",
          "label": "Direct action",
          "rationale":
            "Action-oriented, yet “get started” can imply setup work before value — less reassuring than a named trial for first-time visitors.",
        },
      ],
    },
    "headline": {
      "current": "The CRM that works for your team",
      "variants": [
        {
          "text": "CRM for teams that want simplicity and efficiency.",
          "label": "Category + audience",
          "recommended": true,
          "rationale":
            "Names category and audience in the first line so a cold visitor immediately knows what folk is and who it is for — the current headline could apply to any team tool.",
        },
        {
          "text": "Tired of complex CRMs? Simplify your workflow with folk.",
          "label": "Problem + solution",
          "rationale":
            "Leads with pain, which can resonate with switchers, but the question format adds friction before the value prop lands.",
        },
        {
          "text": "Simple CRM for teams who outgrew spreadsheets.",
          "label": "Outcome + audience",
          "rationale":
            "Strong upgrade story for spreadsheet users, but narrows the audience — teams already on another CRM may bounce before reading further.",
        },
      ],
    },
    "subheadline": {
      "current": "folk CRM captures the full context of your relationships in one beautifully simple CRM.",
      "variants": [
        {
          "text": "Manage every relationship in one simple CRM — free 14-day trial.",
          "label": "Value proposition",
          "recommended": true,
          "rationale":
            "States the core benefit in plain language and adds trial length above the fold — reduces ambiguity after the headline and lowers perceived risk at decision time.",
        },
        {
          "text": "Full relationship context in one place, built for growing teams.",
          "label": "Specificity",
          "rationale":
            "More specific than the current line, but repeats “relationship” without a concrete proof point or trial cue to nudge the click.",
        },
        {
          "text": "Less busywork, more time on the relationships that matter.",
          "label": "Outcome",
          "rationale":
            "Outcome-led and emotional, yet abstract — visitors may want one tangible feature or number before trusting the claim.",
        },
      ],
    },
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
      "dimension": "border_radius",
      "impact": "high",
      "element": "cards & primary button",
      "observation": "Large 16px+ rounding signals consumer-playful, not team CRM — it undercuts the B2B credibility the copy is working for.",
      "recommendation": "Tighten card and button radius to 8px"
    },
    {
      "dimension": "color_contrast",
      "impact": "medium",
      "element": "hero subheadline",
      "observation": "Light gray subheadline sits below 4.5:1 contrast — hard to scan above fold",
      "recommendation": "Darken to #4A5568 at minimum 18px"
    },
    {
      "dimension": "depth",
      "impact": "medium",
      "element": "hero section",
      "observation": "Flat white hero lacks depth and rhythm — feels unfinished vs product shots",
      "recommendation": "Add a #F8F8F6 section tint behind the hero"
    },
    {
      "dimension": "cta_hierarchy",
      "impact": "low",
      "element": "hero buttons",
      "observation": "\"Start for free\" and \"Book a demo\" carry equal weight — splits attention",
      "recommendation": "Demote \"Book a demo\" to a ghost / text-link style"
    }
  ],
  "visual_passes": [
    {
      "dimension": "spacing",
      "note": "follows a consistent 8px scale"
    },
    {
      "dimension": "color_tone",
      "note": "Single accent color used consistently for actions"
    },
    {
      "dimension": "social_proof",
      "note": "Favicon and social share image present"
    }
  ],
  "previewImage": "/demo/folk-preview.jpg"
} satisfies AuditReport;

export function getDemoReportJson(): string {
  return JSON.stringify(DEMO_REPORT);
}
