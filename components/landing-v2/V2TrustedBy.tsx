"use client";

import { useEffect, useRef } from "react";
import { RiErrorWarningFill, RiPulseLine } from "@remixicon/react";

const FALLBACK_COUNT = 1247;

type V2TrustedByProps = {
  auditedCount?: number | null;
};

const AUDITS = [
  {
    name: "folk.app",
    initial: "f",
    color: "#6D5BD0",
    category: "MESSAGING",
    finding: "Hero headline — audience unclear",
  },
  {
    name: "notion.so",
    initial: "N",
    color: "#111",
    category: "CTA COPY",
    finding: '"Get Started" — no outcome stated',
  },
  {
    name: "figma.com",
    initial: "F",
    color: "#F24E1E",
    category: "FRICTION",
    finding: "6 nav items compete with the CTA",
  },
  {
    name: "linear.app",
    initial: "L",
    color: "#5E6AD2",
    category: "CONTRAST",
    finding: "Contrast 2.8:1 — fails WCAG AA",
  },
];

export function V2TrustedBy({ auditedCount = null }: V2TrustedByProps) {
  const target = typeof auditedCount === "number" && auditedCount > 0 ? auditedCount : FALLBACK_COUNT;
  const counterRef = useRef<HTMLSpanElement>(null);
  const observedRef = useRef(false);

  useEffect(() => {
    const el = counterRef.current;
    if (!el || observedRef.current) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          observedRef.current = true;
          const dur = 1500;
          const t0 = performance.now();
          function step(now: number) {
            const p = Math.min(1, (now - t0) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            el!.textContent = Math.round(target * eased).toLocaleString("en-US");
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        });
      },
      { threshold: 0.45 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  return (
    <section className="border-t border-lv2-border bg-white px-6 py-[96px] md:px-[72px] md:py-[104px]">
      <div className="mx-auto max-w-[1080px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-8">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 font-mono text-[11.5px] tracking-[.1em] text-v2-ink-muted">
              <RiPulseLine size={14} className="text-lv2-green" aria-hidden />
              TRUSTED BY BUILDERS
            </span>
            <div className="flex flex-wrap items-baseline gap-[14px]">
              <span
                ref={counterRef}
                className="font-sans text-[64px] font-bold leading-none tracking-[-0.04em] text-v2-dark"
              >
                {target.toLocaleString("en-US")}
              </span>
              <span className="text-[19px] text-v2-ink-secondary">pages analysed and counting.</span>
            </div>
          </div>
          <p className="font-mono text-[11.5px] tracking-[.05em] text-v2-ink-faint md:max-w-[30ch] md:text-right">
            Every audit runs the same 47 deterministic checks — no two reports drift.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUDITS.map((a) => (
            <div
              key={a.name}
              className="flex flex-col rounded-[16px] border border-lv2-card-border bg-lv2-list-bg px-[22px] py-[24px]"
            >
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] text-[18px] font-bold text-white"
                  style={{ backgroundColor: a.color }}
                >
                  {a.initial}
                </span>
                <span className="font-mono text-[16px] font-medium text-v2-dark">{a.name}</span>
              </div>
              <span className="mb-3 inline-flex self-start items-center gap-[6px] rounded-full bg-lv2-amber-bg px-[10px] py-[5px] font-mono text-[10.5px] font-semibold tracking-[.05em] text-lv2-amber">
                <RiErrorWarningFill size={11} aria-hidden />
                {a.category}
              </span>
              <p className="text-[15px] leading-[1.45] text-v2-dim">{a.finding}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
