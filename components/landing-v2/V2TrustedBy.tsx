"use client";

import { useEffect, useRef, useState } from "react";
import { RiErrorWarningFill, RiPulseLine } from "@remixicon/react";
import type { ExampleReport } from "@/lib/example-reports";
import { getDomain, getTopFinding, getTopFindingCategory } from "@/lib/example-reports";

const FALLBACK_COUNT = 1247;

const FALLBACK_AUDITS = [
  {
    name: "tally.so",
    category: "CTA COPY",
    finding: '"Create a form" — no benefit or outcome stated',
  },
  {
    name: "beehiiv.com",
    category: "TRUST",
    finding: "0 logos or testimonials above fold on free plan page",
  },
  {
    name: "loops.so",
    category: "MESSAGING",
    finding: "Headline addresses devs and marketers in same sentence",
  },
  {
    name: "dub.co",
    category: "CONTRAST",
    finding: "Primary CTA contrast ratio 3.1:1 — fails WCAG AA",
  },
];

type AuditCard = {
  name: string;
  category: string;
  finding: string;
};

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function reportsToCards(reports: ExampleReport[]): AuditCard[] {
  return reports
    .map((r) => {
      const finding = getTopFinding(r.payload);
      if (!finding) return null;
      return {
        name: getDomain(r.audited_url),
        category: getTopFindingCategory(r.payload),
        finding,
      };
    })
    .filter((c): c is AuditCard => c !== null);
}

type V2TrustedByProps = {
  auditedCount?: number | null;
  exampleReports?: ExampleReport[];
};

export function V2TrustedBy({ auditedCount = null, exampleReports = [] }: V2TrustedByProps) {
  const target = typeof auditedCount === "number" && auditedCount > 0 ? auditedCount : FALLBACK_COUNT;
  const counterRef = useRef<HTMLSpanElement>(null);
  const observedRef = useRef(false);

  const dynamicCards = reportsToCards(exampleReports);
  const [cards, setCards] = useState<AuditCard[]>(
    dynamicCards.length >= 4
      ? dynamicCards.slice(0, 4)
      : FALLBACK_AUDITS
  );

  useEffect(() => {
    if (dynamicCards.length >= 4) {
      setCards(shuffle(dynamicCards).slice(0, 4));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="mx-auto max-w-[1180px]">
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
          {cards.map((a, i) => (
            <div
              key={`${a.name}-${i}`}
              className="flex flex-col rounded-[16px] border border-lv2-list-border bg-lv2-list-bg px-[22px] py-[24px]"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${a.name}&sz=64`}
                    alt={a.name}
                    width={28}
                    height={28}
                    className="h-[28px] w-[28px] object-contain"
                  />
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
