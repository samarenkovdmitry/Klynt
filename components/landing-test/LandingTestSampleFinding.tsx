import Link from "next/link";
import {
  RiArrowRightLine,
  RiContrast2Line,
  RiErrorWarningFill,
  RiPencilLine,
  RiShieldCrossLine,
} from "@remixicon/react";

import { DEMO_REPORT_PATH } from "@/lib/demo-report";

import {
  LANDING_BORDER_LINK,
  LANDING_CONTAINER,
  LANDING_DARK_BG,
  LANDING_EYEBROW,
  LANDING_LEAD,
  LANDING_SECTION,
  LANDING_SURFACE_BG,
  LANDING_TITLE,
} from "./landingPageStyles";

/** Curated finding — sharper than raw demo JSON, same shape as a real report hero card */
const HERO_FINDING = {
  domain: "folk.app",
  score: "6.1",
  title: "Primary CTA doesn't clarify what 'free' means",
  whyItMatters:
    "B2B visitors with purchase intent abandon when the primary action doesn't match their goal.",
  before: "Start for free",
  after: "Start your free trial, no credit card needed",
  beforeTag: "No trial signal · unclear next step",
  afterTag: "Trial explicit · low friction",
} as const;

const MORE_FINDINGS = [
  {
    icon: RiShieldCrossLine,
    badge: "Structure",
    headline: "Pricing hidden behind navigation click",
    detail: "B2B evaluators can't self-qualify without leaving the conversion flow",
    accent: "#FF5A4F",
  },
  {
    icon: RiPencilLine,
    badge: "Copy",
    headline: "Subheadline truncated mid-sentence",
    detail: "Value prop breaks before the AI differentiator lands",
    accent: "#818CF8",
    compare: {
      before: "AI Assistants learn from this da…",
      after: "AI Assistants surface what to do next",
    },
  },
  {
    icon: RiContrast2Line,
    badge: "Visual",
    headline: "5,000 users cited, but no logos above fold",
    detail: "Social proof count is strong; named logos would add credibility",
    accent: "#D08700",
    stat: "0",
    statSuffix: "customer logos near hero",
  },
] as const;

type MiniFinding = {
  icon: typeof MORE_FINDINGS[number]["icon"];
  badge: string;
  headline: string;
  detail: string;
  accent: string;
  compare?: { before: string; after: string };
  stat?: string;
  statSuffix?: string;
};

function BeforeAfterPanel() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_28px_1fr] sm:items-stretch">
      <div className="overflow-hidden rounded-[12px] border border-[rgba(6,28,47,0.08)]">
        <div className="flex items-center justify-between border-b border-[rgba(6,28,47,0.06)] bg-[#F7F6F3] px-4 py-2.5">
          <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[rgba(6,28,47,0.4)]">
            Before
          </span>
          <span className="text-[12px] font-normal text-[rgba(6,28,47,0.45)]">
            {HERO_FINDING.beforeTag}
          </span>
        </div>
        <div className="bg-white px-4 py-5 md:px-5 md:py-6">
          <p className="text-[17px] font-semibold leading-[1.3] tracking-[-0.01em] text-[#9CA3AF] md:text-[19px]">
            {HERO_FINDING.before}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center py-1 sm:py-0">
        <RiArrowRightLine
          size={18}
          className="rotate-90 text-[rgba(6,28,47,0.2)] sm:rotate-0"
          aria-hidden
        />
      </div>

      <div className="overflow-hidden rounded-[12px] border border-indigo-200">
        <div className="flex items-center justify-between border-b border-indigo-100 bg-indigo-50 px-4 py-2.5">
          <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-indigo-700">
            Recommended
          </span>
          <span className="text-[12px] font-normal text-indigo-600">
            {HERO_FINDING.afterTag}
          </span>
        </div>
        <div className="bg-white px-4 py-5 md:px-5 md:py-6">
          <p className="text-[17px] font-bold leading-[1.3] tracking-[-0.01em] text-indigo-950 md:text-[19px]">
            {HERO_FINDING.after}
          </p>
        </div>
      </div>
    </div>
  );
}

function MiniFindingCard({
  icon: Icon,
  badge,
  headline,
  detail,
  accent,
  compare,
  stat,
  statSuffix,
}: MiniFinding) {
  return (
    <article
      className={[
        "flex h-full flex-col rounded-[14px] border border-white/[0.08] p-4 md:p-5",
        LANDING_DARK_BG,
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accent}18`, color: accent }}
        >
          <Icon size={15} aria-hidden />
        </span>
        <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-white/35">
          {badge}
        </span>
      </div>

      {stat ? (
        <div className="mt-4">
          <p className="text-[36px] font-semibold leading-none tracking-[-0.04em] text-white md:text-[40px]">
            {stat}
          </p>
          {statSuffix ? (
            <p className="mt-2 text-[12px] leading-[18px] text-white/40">{statSuffix}</p>
          ) : null}
        </div>
      ) : null}

      <h3
        className={[
          "font-semibold leading-[1.35] tracking-[-0.01em] text-white",
          stat ? "mt-3 text-[14px]" : "mt-4 text-[15px] md:text-[16px]",
        ].join(" ")}
      >
        {headline}
      </h3>

      {compare ? (
        <div className={`mt-3 space-y-2 rounded-[10px] p-3 ${LANDING_SURFACE_BG}`}>
          <p className="text-[12px] leading-[1.4] text-white/35 line-through decoration-white/15">
            {compare.before}
          </p>
          <p className="text-[12px] font-semibold leading-[1.4] text-emerald-300">
            {compare.after}
          </p>
        </div>
      ) : null}

      <p className="mt-auto pt-3 text-[13px] leading-[20px] text-white/40">{detail}</p>
    </article>
  );
}

export function LandingTestSampleFinding() {
  return (
    <section
      className={`relative overflow-hidden ${LANDING_SECTION}`}
      aria-labelledby="sample-finding-heading"
    >
      {/* Edge glows — desktop only; section border stays LANDING_SECTION default */}
      <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
        <div
          className="absolute inset-y-0 left-0 w-[min(42vw,520px)]"
          style={{
            background:
              "radial-gradient(ellipse 100% 70% at 0% 38%, rgba(99, 102, 241, 0.28) 0%, rgba(79, 70, 229, 0.10) 45%, transparent 72%)",
          }}
        />
        <div
          className="absolute inset-y-0 right-0 w-[min(38vw,460px)]"
          style={{
            background:
              "radial-gradient(ellipse 100% 65% at 100% 62%, rgba(124, 58, 237, 0.20) 0%, rgba(99, 102, 241, 0.07) 48%, transparent 74%)",
          }}
        />
      </div>

      <div className={`relative z-[1] ${LANDING_CONTAINER}`}>
        <div className="mx-auto max-w-[640px] text-center">
          <p className={LANDING_EYEBROW}>Real example</p>
          <h2
            id="sample-finding-heading"
            className={`${LANDING_TITLE} mx-auto text-center`}
          >
            What Klynt actually finds
          </h2>
          <p className={`${LANDING_LEAD} mx-auto mt-4 max-w-[540px] text-center`}>
            Not vague UX tips. Specific gaps, ready-to-paste rewrites, and score impact for each fix.
          </p>
        </div>

        {/* Hero finding — report-style white card */}
        <div className="mx-auto mt-12 max-w-[840px] md:mt-14">
          <article className="overflow-hidden rounded-[16px] border border-white/[0.08] bg-white font-sans shadow-[0_24px_64px_rgba(0,0,0,0.32)] md:rounded-[20px]">
            <div className="px-5 py-5 md:px-7 md:py-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex h-[27px] shrink-0 items-center gap-1.5 rounded-full border border-[#F9D5D5] bg-[#FDEAEA] px-3 text-[13px] font-bold text-[#FF5A4F]">
                  <RiErrorWarningFill size={14} aria-hidden />
                  Critical gap
                </span>
                <span className="text-[13px] font-medium text-[rgba(6,28,47,0.45)]">
                  {HERO_FINDING.domain} · {HERO_FINDING.score}/10
                </span>
              </div>

              <h3 className="max-w-[560px] text-[20px] font-semibold leading-[1.25] tracking-[-0.02em] text-[#061C2F] md:text-[24px]">
                {HERO_FINDING.title}
              </h3>
              <p className="mt-3 max-w-[640px] text-[14px] leading-[24px] text-[rgba(6,28,47,0.55)] md:text-[15px] md:leading-[26px]">
                {HERO_FINDING.whyItMatters}
              </p>

              <div className="mt-6">
                <BeforeAfterPanel />
              </div>
            </div>
          </article>
        </div>

        {/* Breadth row — three more finding types */}
        <div className="mx-auto mt-5 grid max-w-[840px] grid-cols-1 gap-4 sm:grid-cols-3 md:mt-6">
          {MORE_FINDINGS.map((finding) => (
            <MiniFindingCard key={finding.badge} {...finding} />
          ))}
        </div>

        <div className="mt-10 flex justify-center md:mt-12">
          <Link href={DEMO_REPORT_PATH} className={LANDING_BORDER_LINK}>
            See full report
            <RiArrowRightLine size={18} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
