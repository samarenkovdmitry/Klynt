// lib/analysis/mock-narrative-fixture.ts
// Тестовые данные для рескина UI без реальных вызовов /api/narrative.
// Используется только когда process.env.NARRATIVE_MOCK === "true".

export const mockNarrativeFixture = {
  verdict: "Headline unclear about target audience",
  summary: "Visitors can't tell who the product is for or what they'll get in the first few seconds.",
  key_observation: "weak_trust_signals", // один из 6 enum-значений — финализировать список

  hero_bridge: "Fix this first — it's suppressing 15-20 points of conversion alone.",

  score: {
    current: 6.5,
    potential: 8.0,
    status: "at_risk", // "healthy" | "at_risk" | "critical"
    deltas: [
      { finding_id: "f1", points: 1.0 },
      { finding_id: "f2", points: 0.5 }
    ]
  },

  trust_meta: {
    trust_signals: { label: "Trust signals", score_pct: 55, note: "Some credibility is visible, but trust may not feel immediate or complete." },
    decision_clarity: { label: "Decision clarity", score_pct: 65, note: "The next step may require additional scanning before becoming obvious." },
    cognitive_friction: { label: "Cognitive friction", score_pct: 48, note: "Noticeable visual or messaging friction may interrupt early comprehension." },
    visual_hierarchy: { label: "Visual hierarchy", score_pct: 75, note: "Visual hierarchy likely guides attention toward the primary message and action." },
    ai_confidence_pct: 88
  },

  findings: [
    {
      id: "f1",
      title: "Headline unclear about audience",
      category: "copy",
      severity: "critical",
      impact_score: 92, // reach (детерминированно) × drag (модель) — mock-значение
      rationale: "The hero headline speaks to automation broadly without specifying who benefits.",
      evidence: "\"Your tools. Your rules. Any AI.\"",
      reasoning_chain: {
        sees: "A bold automation claim, no mention of team size or industry",
        infers: "This could be built for anyone, meaning it probably isn't built for them",
        decides: "Leaves in the first 3 seconds instead of scrolling to find proof"
      },
      why_it_matters_here: "Crowded B2B category — visitors compare 4-5 tools before clicking. An unclear headline costs more here than on a single-product page.",
      fix_summary: "Name the specific audience and core benefit in the headline."
    },
    {
      id: "f2",
      title: "No social proof above the fold",
      category: "trust",
      severity: "high",
      impact_score: 68,
      rationale: "Above-fold content shows feature callouts but no verified user counts or logos.",
      evidence: "450K+ / 9,000+ / 3.39M+ stat blocks with no source attribution",
      reasoning_chain: {
        sees: "Large numbers with no named companies or verification",
        infers: "These could be inflated or unverifiable",
        decides: "Doesn't trust the claim enough to keep reading"
      },
      why_it_matters_here: "First-time visitors from paid channels have no prior trust — unverified numbers don't compensate for that.",
      fix_summary: "Add named customer logos or a linked verification source next to the stats."
    }
  ],

  copy_studio: [
    {
      field: "headline",
      before: "Your tools. Your rules. Any AI.",
      variants: [
        { strategy: "outcome_led", after: "Ship UX fixes your visitors actually notice.", recommended: false, reason: "Leads with the result but stays generic." },
        { strategy: "audience_led", after: "Built for indie founders shipping landing pages solo.", recommended: false, reason: "Names the audience directly but omits urgency." },
        { strategy: "urgency_led", after: "Every unclear headline costs you visitors today.", recommended: true, reason: "Combines the core finding with a reason to act now — strongest fit given the critical severity of this issue." }
      ]
    }
  ],

  visual_fixes: [
    {
      title: "CTA hierarchy",
      issue: "Primary and secondary CTAs share the same visual weight, diluting the intended action.",
      recommendation: "Increase contrast on the primary CTA and convert secondary actions to text links."
    }
  ]
};
