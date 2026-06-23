import {
  RiFocus2Line,
  RiShieldCheckLine,
  RiCursorLine,
  RiFlashlightLine,
  RiRouteLine,
} from "@remixicon/react";

const DIMENSIONS = [
  {
    icon: RiShieldCheckLine,
    title: "Trust signals",
    body: "Logos, testimonials, guarantees and credibility cues — proof that makes visitors feel safe converting.",
    finding: "0 customer logos above fold",
  },
  {
    icon: RiCursorLine,
    title: "Messaging clarity",
    body: "Whether your headline, subheadline and CTA communicate who this is for and what happens next.",
    finding: '"Get Started" — no outcome stated',
  },
  {
    icon: RiFlashlightLine,
    title: "Cognitive friction",
    body: "Layout and copy complexity that makes visitors think harder than they should — nav, density, competing CTAs.",
    finding: "6 nav items compete with CTA",
  },
  {
    icon: RiRouteLine,
    title: "Visual hierarchy",
    body: "Whether the page guides the eye to the right elements in the right order — headline, CTA, social proof.",
    finding: "Trial duration not mentioned",
  },
];

const TAGS = ["COPY STUDIO", "VISUAL FIXES", "TRUST & META", "EXPORT"];

export function V2WhatKlyntFinds() {
  return (
    <section className="border-t border-lv2-border bg-lv2-cream px-6 py-[96px] md:px-[72px] md:py-[104px]">
      <div className="mx-auto max-w-[1080px]">
        <div className="mb-[52px] max-w-[680px]">
          <span className="mb-[18px] inline-flex items-center gap-2 font-mono text-[11.5px] tracking-[.1em] text-v2-ink-muted">
            <RiFocus2Line size={14} className="text-lv2-green" aria-hidden />
            WHAT KLYNT FINDS
          </span>
          <h2 className="mb-4 text-[42px] font-bold leading-[1.05] tracking-[-0.03em]">
            Four dimensions, checked the same way every time.
          </h2>
          <p className="max-w-[52ch] text-[18px] leading-[1.55] text-v2-ink-secondary">
            Each one is measured, not guessed — and each comes back with a concrete example pulled
            straight from your page.
          </p>
        </div>

        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
          {DIMENSIONS.map((d) => {
            const Icon = d.icon;
            return (
              <div
                key={d.title}
                className="flex flex-col rounded-[16px] border border-lv2-card-border bg-white px-[24px] pb-[24px] pt-[26px]"
              >
                <div className="mb-5 flex h-[44px] w-[44px] items-center justify-center rounded-[11px] bg-lv2-cream">
                  <Icon size={21} className="text-v2-dark" aria-hidden />
                </div>
                <h3 className="mb-2 text-[18px] font-semibold tracking-[-0.01em]">{d.title}</h3>
                <p className="mb-[18px] text-[14px] leading-[1.5] text-v2-ink-secondary">{d.body}</p>
                <span className="mt-auto rounded-[8px] bg-lv2-amber-bg px-[11px] py-[9px] font-mono text-[11.5px] leading-[1.45] text-lv2-amber">
                  {d.finding}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-x-[22px] gap-y-[14px]">
          {TAGS.map((t, i) => (
            <span key={t} className="inline-flex items-center gap-[22px]">
              <span className="font-mono text-[11.5px] tracking-[.12em] text-v2-ink-muted">{t}</span>
              {i < TAGS.length - 1 && (
                <span className="font-mono text-[11.5px] text-lv2-border" aria-hidden>·</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
