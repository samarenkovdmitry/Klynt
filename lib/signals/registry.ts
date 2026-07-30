import type { SignalContext, SignalDefinition, SignalEvaluation } from "./types";
import {
  measureContrast,
  parseFontSizePx,
  parseFontWeight,
  suggestAaForeground,
} from "./wcag-contrast";
import { mobileElementMissing } from "./mobile-comparison";

const GENERIC_CTA =
  /^(get\s+started|started|learn\s+more|click\s+here|sign\s+up(\s+free)?|submit|continue|explore|discover|try\s+now|try\s+free|try\s+it(\s+free)?|register|join(\s+now)?|start\s+free|start\s+now|book\s+demo|see\s+demo)$/i;

function contrastSignal(
  id: string,
  element: string,
  failTitle: string,
  getColors: (ctx: SignalContext) => {
    fg: string | null;
    bg: string | null;
    fontSize?: string | null;
    fontWeight?: string | null;
  },
  link_to: SignalDefinition["link_to"] = "visual-fixes"
): SignalDefinition {
  return {
    id,
    methodologyCategory: "visual_hierarchy",
    checklistCategory: "visual",
    link_to,
    failTitle,
    fix: `Increase ${element.toLowerCase()} contrast to at least 4.5:1 (WCAG AA).`,
    why: "Low contrast makes hero copy hard to scan on first visit, especially on mobile.",
    evaluate(ctx) {
      const { fg, bg, fontSize, fontWeight } = getColors(ctx);
      const measurement = measureContrast(fg, bg, {
        element,
        fontSizePx: parseFontSizePx(fontSize ?? null),
        fontWeight: parseFontWeight(fontWeight ?? null),
      });
      if (!measurement) return null;

      if (measurement.passes) {
        return {
          status: "pass",
          evidence: `${measurement.ratioLabel} contrast`,
          measured: {
            ratio: measurement.ratio,
            ratioLabel: measurement.ratioLabel,
            threshold: measurement.threshold,
            foregroundHex: measurement.foregroundHex,
            backgroundHex: measurement.backgroundHex,
            element,
          },
        } satisfies SignalEvaluation;
      }

      const suggested = suggestAaForeground(bg, measurement.threshold);

      return {
        status: measurement.ratio < 3 ? "missing" : "weak",
        evidence: `${measurement.ratioLabel} · needs ${measurement.threshold}:1`,
        title: `${element} contrast fails WCAG AA`,
        measured: {
          ratio: measurement.ratio,
          ratioLabel: measurement.ratioLabel,
          threshold: measurement.threshold,
          foregroundHex: measurement.foregroundHex,
          backgroundHex: measurement.backgroundHex,
          suggestedForegroundHex: suggested,
          element,
        },
        impact_score: measurement.ratio < 3 ? 85 : 65,
      } satisfies SignalEvaluation;
    },
  };
}

export const SIGNAL_REGISTRY: SignalDefinition[] = [
  // ── Technical & meta ─────────────────────────────────────────────────────
  {
    id: "meta_title_present",
    methodologyCategory: "technical_meta",
    checklistCategory: "structure",
    link_to: "structure-nav",
    failTitle: "Page title tag is empty",
    fix: "Add a unique <title> with product name and primary outcome (50–60 chars).",
    evaluate(ctx) {
      const title = ctx.pageMeta?.title?.trim() ?? "";
      if (!title) {
        return { status: "missing", evidence: "document.title empty", impact_score: 70 };
      }
      const len = title.length;
      if (len < 20) {
        return { status: "weak", evidence: `title ${len} chars`, impact_score: 45 };
      }
      return { status: "pass", evidence: `title ${len} chars` };
    },
  },
  {
    id: "meta_description_present",
    methodologyCategory: "technical_meta",
    checklistCategory: "structure",
    link_to: "structure-nav",
    failTitle: "Meta description is missing",
    fix: "Add a meta description (~150 chars) with audience, outcome, and CTA hint.",
    evaluate(ctx) {
      const desc = ctx.pageMeta?.description?.trim() ?? "";
      if (!desc) {
        return { status: "missing", evidence: "no meta description", impact_score: 55 };
      }
      const len = desc.length;
      if (len < 70) {
        return { status: "weak", evidence: `description ${len} chars`, impact_score: 35 };
      }
      return { status: "pass", evidence: `description ${len} chars` };
    },
  },
  {
    id: "mobile_viewport_meta",
    methodologyCategory: "technical_meta",
    checklistCategory: "structure",
    link_to: "structure-nav",
    failTitle: "Mobile viewport meta tag missing",
    fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.',
    evaluate(ctx) {
      const has = ctx.pageMeta?.hasMobileViewportMeta ?? ctx.extraction.hasMobileViewport;
      if (!has) {
        return { status: "missing", evidence: "no viewport meta", impact_score: 75 };
      }
      return { status: "pass", evidence: "viewport meta present" };
    },
  },

  // ── Messaging clarity ────────────────────────────────────────────────────
  {
    id: "headline_present",
    methodologyCategory: "messaging_clarity",
    checklistCategory: "copy",
    link_to: "copy-headline",
    failTitle: "Hero headline is missing",
    fix: "Add a single H1 above the fold that states who it's for and the outcome.",
    evaluate(ctx) {
      const h1 =
        ctx.computedValues?.h1_text?.trim() ||
        ctx.extraction.headline?.trim() ||
        "";
      if (!h1) {
        return { status: "missing", evidence: "no H1 detected", impact_score: 90 };
      }
      if (h1.length < 12) {
        return { status: "weak", evidence: `H1 ${h1.length} chars`, impact_score: 50 };
      }
      return { status: "pass", evidence: `H1 ${h1.length} chars` };
    },
  },
  {
    id: "value_proposition_clear",
    methodologyCategory: "messaging_clarity",
    checklistCategory: "copy",
    link_to: "copy-headline",
    failTitle: "Value proposition is unclear",
    fix: "Rewrite the hero to answer: what is it, who is it for, and what outcome they get.",
    evaluate(ctx) {
      if (ctx.extraction.valuePropositionClear) {
        return { status: "pass", evidence: "clear value prop" };
      }
      return {
        status: "missing",
        evidence: "value prop unclear",
        impact_score: 80,
      };
    },
  },
  {
    id: "target_audience_mentioned",
    methodologyCategory: "messaging_clarity",
    checklistCategory: "copy",
    link_to: "copy-headline",
    failTitle: "Target audience not signaled",
    fix: "Name the audience in the headline or subheadline (role, industry, or use case).",
    evaluate(ctx) {
      if (ctx.extraction.targetAudienceMentioned) {
        return { status: "pass", evidence: "audience mentioned" };
      }
      return { status: "weak", evidence: "no audience signal", impact_score: 55 };
    },
  },
  {
    id: "subheadline_present",
    methodologyCategory: "messaging_clarity",
    checklistCategory: "copy",
    link_to: "copy-subheadline",
    failTitle: "Subheadline missing or too short",
    fix: "Add a subheadline that expands the headline with a concrete outcome or proof point.",
    evaluate(ctx) {
      const sub =
        ctx.computedValues?.sub_text?.trim() ||
        ctx.extraction.subheadline?.trim() ||
        "";
      if (!sub) {
        return { status: "missing", evidence: "no subheadline", impact_score: 60 };
      }
      if (sub.length < 24) {
        return { status: "weak", evidence: `sub ${sub.length} chars`, impact_score: 40 };
      }
      return { status: "pass", evidence: `sub ${sub.length} chars` };
    },
  },

  // ── Copy specificity ─────────────────────────────────────────────────────
  {
    id: "cta_present",
    methodologyCategory: "copy_specificity",
    checklistCategory: "copy",
    link_to: "copy-cta",
    failTitle: "Primary CTA not detected",
    fix: "Add one primary button above the fold with a specific next step.",
    evaluate(ctx) {
      const cta =
        ctx.computedValues?.cta_text?.trim() ||
        ctx.extraction.primaryCta.text?.trim() ||
        "";
      if (!cta) {
        return { status: "missing", evidence: "no CTA text", impact_score: 85 };
      }
      return { status: "pass", evidence: `"${cta.slice(0, 28)}"` };
    },
  },
  {
    id: "cta_specificity",
    methodologyCategory: "copy_specificity",
    checklistCategory: "copy",
    link_to: "copy-cta",
    failTitle: "Primary CTA is generic",
    fix: 'Replace generic CTA with a specific outcome (e.g. "Start free trial" or "See pricing").',
    evaluate(ctx) {
      const cta =
        ctx.computedValues?.cta_text?.trim() ||
        ctx.extraction.primaryCta.text?.trim() ||
        "";
      if (!cta) return null;
      if (ctx.extraction.primaryCta.specificity === "specific") {
        return { status: "pass", evidence: "specific CTA" };
      }
      if (GENERIC_CTA.test(cta) || ctx.extraction.primaryCta.specificity === "generic") {
        return { status: "missing", evidence: `"${cta.slice(0, 24)}"`, impact_score: 72 };
      }
      return { status: "pass", evidence: "CTA not generic" };
    },
  },
  {
    id: "cta_above_fold",
    methodologyCategory: "conversion_friction",
    checklistCategory: "copy",
    link_to: "copy-cta",
    failTitle: "Primary CTA below the fold",
    fix: "Move the primary CTA into the first viewport on desktop and mobile.",
    evaluate(ctx) {
      const ctaText =
        ctx.computedValues?.cta_text?.trim() ||
        ctx.extraction.primaryCta.text?.trim();
      if (!ctaText) return null;
      if (ctx.extraction.primaryCta.aboveFold) {
        return { status: "pass", evidence: "CTA above fold" };
      }
      return { status: "missing", evidence: "CTA below fold", impact_score: 68 };
    },
  },
  {
    id: "cta_count",
    methodologyCategory: "conversion_friction",
    checklistCategory: "copy",
    link_to: "copy-cta",
    failTitle: "Too many competing CTAs",
    fix: "Keep one primary CTA above the fold; demote secondary actions to text links.",
    evaluate(ctx) {
      const count = ctx.extraction.ctaCount;
      if (count <= 0) return null;
      if (count <= 2) {
        return { status: "pass", evidence: `${count} CTAs detected` };
      }
      if (count === 3) {
        return { status: "weak", evidence: `${count} CTAs`, impact_score: 35 };
      }
      return { status: "missing", evidence: `${count} CTAs`, impact_score: 50 };
    },
  },

  // ── Trust ────────────────────────────────────────────────────────────────
  {
    id: "social_proof_above_fold",
    methodologyCategory: "trust_signals",
    checklistCategory: "trust",
    link_to: "trust",
    failTitle: "No trust proof above the fold",
    fix: "Add logos, a rating, or a one-line testimonial directly under the hero subheadline.",
    evaluate(ctx) {
      const aboveFold =
        ctx.computedValues?.social_proof_above_fold ??
        ctx.extraction.socialProofAboveFold;
      if (aboveFold) {
        return { status: "pass", evidence: "proof above fold" };
      }
      if (ctx.computedValues?.social_proof_found || ctx.extraction.socialProofTypes.some((t) => t !== "none")) {
        return { status: "weak", evidence: "proof below fold", impact_score: 55 };
      }
      return { status: "missing", evidence: "no proof above fold", impact_score: 70 };
    },
  },
  {
    id: "trusted_by_count",
    methodologyCategory: "trust_signals",
    checklistCategory: "trust",
    link_to: "trust",
    failTitle: "Trust strip has too few logos",
    fix: "Show at least 4 recognizable customer logos or a numeric proof point.",
    evaluate(ctx) {
      const count = ctx.extraction.trustedByCount;
      if (count <= 0) return null;
      if (count >= 4) {
        return { status: "pass", evidence: `${count} logos` };
      }
      return { status: "weak", evidence: `${count} logos only`, impact_score: 40 };
    },
  },

  // ── Visual hierarchy (contrast + spacing + nav) ─────────────────────────
  contrastSignal(
    "h1_contrast_aa",
    "Hero headline",
    "Headline contrast fails WCAG AA",
    (ctx) => ({
      fg: ctx.computedValues?.h1_color ?? null,
      bg: ctx.computedValues?.hero_bg ?? null,
      fontSize: ctx.computedValues?.h1_font_size ?? null,
      fontWeight: ctx.computedValues?.h1_font_weight ?? null,
    }),
    "copy-headline"
  ),
  contrastSignal(
    "subheadline_contrast_aa",
    "Hero subheadline",
    "Subheadline contrast fails WCAG AA",
    (ctx) => ({
      fg: ctx.computedValues?.sub_color ?? null,
      bg: ctx.computedValues?.hero_bg ?? null,
      fontSize: ctx.computedValues?.sub_font_size ?? null,
      fontWeight: ctx.computedValues?.sub_font_weight ?? null,
    }),
    "visual-fixes"
  ),
  contrastSignal("cta_contrast_aa", "Primary CTA", "CTA contrast fails WCAG AA", (ctx) => ({
    fg: ctx.computedValues?.cta_color ?? null,
    bg: ctx.computedValues?.cta_bg ?? null,
    fontSize: null,
    fontWeight: ctx.computedValues?.cta_font_weight ?? null,
  })),
  {
    id: "hero_spacing_h1_sub",
    methodologyCategory: "visual_hierarchy",
    checklistCategory: "visual",
    link_to: "hero-density",
    failTitle: "Headline-to-sub spacing is too tight",
    fix: "Increase gap between H1 and subheadline to at least 16px.",
    evaluate(ctx) {
      const gap = ctx.computedValues?.hero_h1_to_sub_gap;
      if (gap === null || gap === undefined) return null;
      if (gap >= 16) {
        return { status: "pass", evidence: `${gap}px h1-sub gap` };
      }
      return {
        status: gap < 8 ? "missing" : "weak",
        evidence: `${gap}px h1-sub gap`,
        impact_score: gap < 8 ? 55 : 35,
      };
    },
  },
  {
    id: "hero_spacing_sub_cta",
    methodologyCategory: "visual_hierarchy",
    checklistCategory: "visual",
    link_to: "hero-density",
    failTitle: "Subheadline-to-CTA spacing is too tight",
    fix: "Increase gap between subheadline and primary CTA to at least 24px.",
    evaluate(ctx) {
      const gap = ctx.computedValues?.hero_sub_to_cta_gap;
      if (gap === null || gap === undefined) return null;
      if (gap >= 24) {
        return { status: "pass", evidence: `${gap}px sub-CTA gap` };
      }
      return {
        status: gap < 16 ? "missing" : "weak",
        evidence: `${gap}px sub-CTA gap`,
        impact_score: gap < 16 ? 50 : 30,
      };
    },
  },
  {
    id: "nav_link_count",
    methodologyCategory: "visual_hierarchy",
    checklistCategory: "structure",
    link_to: "structure-nav",
    failTitle: "Navigation has too many links",
    fix: "Reduce header nav to 5–7 items; move secondary links to the footer.",
    evaluate(ctx) {
      const count = ctx.computedValues?.nav_link_count;
      if (count === undefined || count === null) return null;
      if (count <= 7) {
        return { status: "pass", evidence: `${count} nav links` };
      }
      return { status: "weak", evidence: `${count} nav links`, impact_score: 40 };
    },
  },

  // ── Conversion friction ──────────────────────────────────────────────────
  {
    id: "form_field_count",
    methodologyCategory: "conversion_friction",
    checklistCategory: "structure",
    link_to: "structure-nav",
    failTitle: "Signup form asks for too many fields",
    fix: "Reduce the first-step form to email only or email + password.",
    evaluate(ctx) {
      const count = ctx.extraction.formFieldCount;
      if (count <= 0) return null;
      if (count <= 3) {
        return { status: "pass", evidence: `${count} fields` };
      }
      if (count <= 5) {
        return { status: "weak", evidence: `${count} fields`, impact_score: 45 };
      }
      return { status: "missing", evidence: `${count} fields`, impact_score: 60 };
    },
  },
  {
    id: "pricing_visible",
    methodologyCategory: "conversion_friction",
    checklistCategory: "structure",
    link_to: "structure-nav",
    failTitle: "Pricing not visible on the page",
    fix: "Add pricing or a clear 'See pricing' path — hidden pricing increases bounce for evaluators.",
    evaluate(ctx) {
      if (ctx.extraction.pricingVisible) {
        return {
          status: "pass",
          evidence: ctx.extraction.pricingAboveFold ? "pricing above fold" : "pricing on page",
        };
      }
      return { status: "weak", evidence: "no pricing found", impact_score: 35 };
    },
  },

  // ── Performance (CDP + Web Vitals) ───────────────────────────────────────
  {
    id: "lcp_threshold",
    methodologyCategory: "technical_meta",
    checklistCategory: "structure",
    link_to: "structure-nav",
    failTitle: "Largest Contentful Paint is slow",
    fix: "Optimize the hero image or largest above-fold element — compress images, preload LCP resource, reduce render-blocking CSS.",
    why: "Slow LCP delays the moment visitors perceive the page as loaded.",
    evaluate(ctx) {
      const lcp = ctx.performanceMetrics?.lcp_ms;
      if (lcp == null || lcp <= 0) return null;
      if (lcp <= 2500) {
        return { status: "pass", evidence: `${lcp}ms LCP` };
      }
      if (lcp <= 4000) {
        return { status: "weak", evidence: `${lcp}ms LCP`, impact_score: 55 };
      }
      return { status: "missing", evidence: `${lcp}ms LCP`, impact_score: 75 };
    },
  },
  {
    id: "cls_threshold",
    methodologyCategory: "technical_meta",
    checklistCategory: "structure",
    link_to: "structure-nav",
    failTitle: "Layout shifts during load",
    fix: "Reserve space for images, embeds, and fonts so content doesn't jump while the page loads.",
    why: "Unexpected layout movement makes CTAs harder to click and erodes trust.",
    evaluate(ctx) {
      const cls = ctx.performanceMetrics?.cls;
      if (cls == null) return null;
      if (cls <= 0.1) {
        return { status: "pass", evidence: `CLS ${cls}` };
      }
      if (cls <= 0.25) {
        return { status: "weak", evidence: `CLS ${cls}`, impact_score: 50 };
      }
      return { status: "missing", evidence: `CLS ${cls}`, impact_score: 70 };
    },
  },
  {
    id: "ttfb_threshold",
    methodologyCategory: "technical_meta",
    checklistCategory: "structure",
    link_to: "structure-nav",
    failTitle: "Server response is slow (TTFB)",
    fix: "Improve hosting/CDN, enable caching, and reduce server-side work before first byte.",
    why: "High TTFB delays everything — HTML, fonts, and hero content all wait on the server.",
    evaluate(ctx) {
      const ttfb = ctx.performanceMetrics?.ttfb_ms;
      if (ttfb == null || ttfb <= 0) return null;
      if (ttfb <= 800) {
        return { status: "pass", evidence: `${ttfb}ms TTFB` };
      }
      if (ttfb <= 1800) {
        return { status: "weak", evidence: `${ttfb}ms TTFB`, impact_score: 50 };
      }
      return { status: "missing", evidence: `${ttfb}ms TTFB`, impact_score: 72 };
    },
  },
  {
    id: "page_weight_threshold",
    methodologyCategory: "technical_meta",
    checklistCategory: "structure",
    link_to: "structure-nav",
    failTitle: "Page transfer size is heavy",
    fix: "Compress images, defer non-critical scripts, and remove unused third-party tags.",
    why: "Heavy pages load slower on mobile networks and increase bounce before the CTA is usable.",
    evaluate(ctx) {
      const weight = ctx.performanceMetrics?.page_weight_kb;
      if (weight == null || weight <= 0) return null;
      if (weight <= 1500) {
        return { status: "pass", evidence: `${weight} KB transferred` };
      }
      if (weight <= 3000) {
        return { status: "weak", evidence: `${weight} KB transferred`, impact_score: 45 };
      }
      return { status: "missing", evidence: `${weight} KB transferred`, impact_score: 65 };
    },
  },

  // ── Mobile vs desktop (390px capture) ────────────────────────────────────
  {
    id: "mobile_cta_visible",
    methodologyCategory: "conversion_friction",
    checklistCategory: "copy",
    link_to: "copy-cta",
    failTitle: "Primary CTA missing on mobile",
    fix: "Ensure the hero CTA stays visible and tappable at 390px — avoid hiding it in a menu or below a collapsed block.",
    why: "Most landing traffic is mobile; a missing CTA removes the main conversion path.",
    evaluate(ctx) {
      const missing = mobileElementMissing(
        ctx.computedValues,
        ctx.mobileComputedValues,
        "cta"
      );
      if (missing == null) return null;
      if (!missing) {
        return { status: "pass", evidence: "CTA on mobile" };
      }
      return {
        status: "missing",
        evidence: "CTA on desktop only",
        impact_score: 88,
      };
    },
  },
  {
    id: "mobile_h1_visible",
    methodologyCategory: "messaging_clarity",
    checklistCategory: "copy",
    link_to: "copy-headline",
    failTitle: "Headline missing on mobile",
    fix: "Fix responsive hero styles so the H1 renders above the fold at 390px width.",
    evaluate(ctx) {
      const missing = mobileElementMissing(
        ctx.computedValues,
        ctx.mobileComputedValues,
        "h1"
      );
      if (missing == null) return null;
      if (!missing) {
        return { status: "pass", evidence: "H1 on mobile" };
      }
      return {
        status: "missing",
        evidence: "H1 on desktop only",
        impact_score: 82,
      };
    },
  },
  {
    id: "mobile_subheadline_visible",
    methodologyCategory: "messaging_clarity",
    checklistCategory: "copy",
    link_to: "copy-subheadline",
    failTitle: "Subheadline missing on mobile",
    fix: "Show the value-prop subheadline on mobile — don't hide it behind breakpoints or truncated hero layouts.",
    evaluate(ctx) {
      const missing = mobileElementMissing(
        ctx.computedValues,
        ctx.mobileComputedValues,
        "sub"
      );
      if (missing == null) return null;
      if (!missing) {
        return { status: "pass", evidence: "subheadline on mobile" };
      }
      return {
        status: "weak",
        evidence: "subheadline desktop only",
        impact_score: 58,
      };
    },
  },
  {
    id: "mobile_h1_contrast_regression",
    methodologyCategory: "visual_hierarchy",
    checklistCategory: "visual",
    link_to: "visual-fixes",
    failTitle: "Headline contrast fails on mobile",
    fix: "Adjust mobile hero text/background colors — contrast that passes on desktop can fail when the mobile layout changes.",
    evaluate(ctx) {
      const desktop = ctx.computedValues;
      const mobile = ctx.mobileComputedValues;
      if (!desktop || !mobile) return null;

      const desktopPass = measureContrast(desktop.h1_color, desktop.hero_bg, {
        element: "H1",
        fontSizePx: parseFontSizePx(desktop.h1_font_size),
        fontWeight: parseFontWeight(desktop.h1_font_weight),
      });
      const mobilePass = measureContrast(mobile.h1_color, mobile.hero_bg, {
        element: "H1",
        fontSizePx: parseFontSizePx(mobile.h1_font_size),
        fontWeight: parseFontWeight(mobile.h1_font_weight),
      });

      if (!desktopPass || !mobilePass) return null;
      if (mobilePass.passes) {
        return { status: "pass", evidence: `${mobilePass.ratioLabel} mobile H1` };
      }
      if (desktopPass.passes) {
        return {
          status: "weak",
          evidence: `${mobilePass.ratioLabel} mobile · desktop OK`,
          impact_score: 62,
        };
      }
      return null;
    },
  },
  {
    id: "mobile_cta_contrast_regression",
    methodologyCategory: "visual_hierarchy",
    checklistCategory: "visual",
    link_to: "visual-fixes",
    failTitle: "CTA contrast fails on mobile",
    fix: "Fix mobile button colors — ghost/outline variants often drop below WCAG AA on small screens.",
    evaluate(ctx) {
      const desktop = ctx.computedValues;
      const mobile = ctx.mobileComputedValues;
      if (!desktop || !mobile) return null;

      const desktopPass = measureContrast(desktop.cta_color, desktop.cta_bg, {
        element: "Primary CTA",
        fontWeight: parseFontWeight(desktop.cta_font_weight),
      });
      const mobilePass = measureContrast(mobile.cta_color, mobile.cta_bg, {
        element: "Primary CTA",
        fontWeight: parseFontWeight(mobile.cta_font_weight),
      });

      if (!desktopPass || !mobilePass) return null;
      if (mobilePass.passes) {
        return { status: "pass", evidence: `${mobilePass.ratioLabel} mobile CTA` };
      }
      if (desktopPass.passes) {
        return {
          status: "weak",
          evidence: `${mobilePass.ratioLabel} mobile · desktop OK`,
          impact_score: 68,
        };
      }
      return null;
    },
  },
];

export function getMethodologyStats(): import("./types").MethodologyStats {
  const byCategory = {
    messaging_clarity: 0,
    trust_signals: 0,
    visual_hierarchy: 0,
    conversion_friction: 0,
    copy_specificity: 0,
    technical_meta: 0,
  } satisfies Record<import("./types").SignalMethodologyCategory, number>;

  for (const signal of SIGNAL_REGISTRY) {
    byCategory[signal.methodologyCategory] += 1;
  }

  return {
    totalSignals: SIGNAL_REGISTRY.length,
    byCategory,
  };
}
