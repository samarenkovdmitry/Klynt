"use client";

import { useEffect, useRef, useState } from "react";
import { RiArrowRightLine, RiErrorWarningFill, RiQuillPenLine } from "@remixicon/react";

const ROTATE_MS = 3500;

const POSITIONS = [
  { y: 0,   scale: 1,    opacity: 1,    z: 40, brightness: 1     },
  { y: -14, scale: 0.96, opacity: 1,    z: 30, brightness: 0.93  },
  { y: -26, scale: 0.92, opacity: 0.55, z: 20, brightness: 0.86  },
] as const;

function pulseStyle(): React.CSSProperties {
  return {
    animation: "kpulse 1.8s ease-out infinite",
  };
}

function CardContrast() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-[13px]">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-[7px] rounded-full bg-lv2-amber-bg px-[11px] py-[6px] font-mono text-[10.5px] font-semibold tracking-[.06em] text-lv2-amber">
          <RiErrorWarningFill size={12} aria-hidden />
          ISSUE · CONTRAST
        </span>
        <span className="inline-flex items-center gap-[6px] font-mono text-[11px] text-v2-ink-faint">
          <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-v2-ink-faint" />
          linear.app
        </span>
      </div>
      <div className="font-sans text-[78px] font-bold leading-[.85] tracking-[-0.045em] text-v2-dark">
        2.8<span className="font-semibold text-[#6B6557]">:1</span>
      </div>
      <span className="font-mono text-[12px] text-v2-ink-muted">contrast ratio · fails WCAG AA</span>
      <div className="flex flex-wrap items-center gap-[10px] text-[12px]">
        <span className="inline-flex items-center gap-[6px] font-mono text-[#9A9588] line-through decoration-[#CBC4B5]">
          <span className="h-[9px] w-[9px] shrink-0 rounded-full bg-[#9CA3AF]" />
          #9CA3AF on white
        </span>
        <RiArrowRightLine size={15} className="text-[#C8C1B1]" aria-hidden />
        <span className="inline-flex items-center gap-[6px] font-mono font-semibold text-v2-dark">
          <span className="h-[9px] w-[9px] shrink-0 rounded-full bg-[#4B5563]" />
          #4B5563 · passes AA
        </span>
      </div>
    </div>
  );
}

function CardCtaCopy() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-[13px]">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-[7px] rounded-full bg-lv2-amber-bg px-[11px] py-[6px] font-mono text-[10.5px] font-semibold tracking-[.06em] text-lv2-amber">
          <RiErrorWarningFill size={12} aria-hidden />
          ISSUE · CTA COPY
        </span>
        <span className="inline-flex items-center gap-[6px] font-mono text-[11px] text-v2-ink-faint">
          <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-v2-ink-faint" />
          notion.so
        </span>
      </div>
      <div className="font-sans text-[52px] font-bold leading-[.95] tracking-[-0.035em] text-v2-dark">
        Get Started
      </div>
      <span className="font-mono text-[12px] text-v2-ink-muted">vague CTA · no outcome stated</span>
      <div className="flex flex-wrap items-center gap-[10px] text-[12px]">
        <span className="font-mono text-[#9A9588] line-through decoration-[#CBC4B5]">Get Started</span>
        <RiArrowRightLine size={15} className="text-[#C8C1B1]" aria-hidden />
        <span className="font-mono font-semibold text-v2-dark">Start free — 14 days, no card</span>
      </div>
    </div>
  );
}

function CardTrust() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-[13px]">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-[7px] rounded-full bg-lv2-amber-bg px-[11px] py-[6px] font-mono text-[10.5px] font-semibold tracking-[.06em] text-lv2-amber">
          <RiErrorWarningFill size={12} aria-hidden />
          ISSUE · TRUST
        </span>
        <span className="inline-flex items-center gap-[6px] font-mono text-[11px] text-v2-ink-faint">
          <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-v2-ink-faint" />
          vercel.com
        </span>
      </div>
      <div className="font-sans text-[78px] font-bold leading-[.85] tracking-[-0.045em] text-v2-dark">0</div>
      <span className="font-mono text-[12px] text-v2-ink-muted">trust signals above the fold</span>
      <div className="flex flex-wrap items-center gap-[10px] text-[12px]">
        <span className="font-mono tracking-[.04em] text-[#9A9588]">ABSENT</span>
        <RiArrowRightLine size={15} className="text-[#C8C1B1]" aria-hidden />
        <span className="font-mono font-semibold text-v2-dark">Customer logos · Ratings · Guarantees</span>
      </div>
    </div>
  );
}

function CardHeadline() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-[18px]">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-[7px] rounded-full bg-lv2-amber-bg px-[11px] py-[6px] font-mono text-[10.5px] font-semibold tracking-[.06em] text-lv2-amber">
          <RiQuillPenLine size={12} aria-hidden />
          HERO HEADLINE · AUDIENCE UNCLEAR
        </span>
        <span className="inline-flex items-center gap-[6px] font-mono text-[11px] text-v2-ink-faint">
          <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-v2-ink-faint" />
          folk.app
        </span>
      </div>
      <div className="grid grid-cols-2 items-start gap-[22px]">
        <div>
          <span className="mb-[9px] block font-mono text-[10.5px] tracking-[.07em] text-[#9A9588]">BEFORE</span>
          <span className="block text-[19px] font-semibold leading-[1.15] tracking-[-0.02em] text-[#9A9588] line-through decoration-[#C3BCAD]">
            The CRM that works for your team
          </span>
        </div>
        <div>
          <span className="mb-[9px] block font-mono text-[10.5px] tracking-[.07em] text-lv2-green">AFTER</span>
          <span className="block text-[19px] font-bold leading-[1.15] tracking-[-0.02em] text-v2-dark">
            Simple CRM for teams who outgrew spreadsheets
          </span>
        </div>
      </div>
    </div>
  );
}

const CARDS = [CardContrast, CardCtaCopy, CardTrust, CardHeadline];

export function FindingCardStack() {
  const [order, setOrder] = useState<number[]>([0, 1, 2, 3]);
  const orderRef = useRef(order);
  orderRef.current = order;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function getStyle(pos: number): React.CSSProperties {
    const p = POSITIONS[pos] ?? { y: -26, scale: 0.92, opacity: 0, z: 10, brightness: 0.86 };
    return {
      transform: `translateY(${p.y}px) scale(${p.scale})`,
      opacity: p.opacity,
      zIndex: p.z,
      filter: `brightness(${p.brightness})`,
      transition: "transform .6s cubic-bezier(.22,.61,.36,1), opacity .55s ease, filter .55s ease",
      transformOrigin: "50% 50%",
    };
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const cur = orderRef.current;
      setOrder((prev) => prev.slice(1).concat([prev[0]]));
    }, ROTATE_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[294px] w-full">
      {CARDS.map((Card, idx) => {
        const pos = order.indexOf(idx);
        return (
          <div
            key={idx}
            className="absolute inset-x-0 top-0 flex h-[294px] flex-col rounded-[24px] bg-lv2-card px-[32px] py-[26px] pb-[22px]"
            style={getStyle(pos)}
          >
            {/* Card header */}
            <div className="mb-[18px] flex shrink-0 items-center justify-between">
              <span className="inline-flex items-center gap-[9px] font-mono text-[11.5px] tracking-[.07em] text-v2-ink-secondary">
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-lv2-green"
                  style={pulseStyle()}
                />
                LIVE FINDING
              </span>
              <span className="font-mono text-[11px] tracking-[.05em] text-v2-ink-hairline">
                85 SIGNALS SCANNED
              </span>
            </div>

            <Card />

            {/* Footer */}
            <div className="mt-[16px] shrink-0 border-t border-[#EDE9E2] pt-[16px]">
              <span className="font-mono text-[10.5px] tracking-[.05em] text-v2-ink-hairline">
                + 23 MORE FINDINGS
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
