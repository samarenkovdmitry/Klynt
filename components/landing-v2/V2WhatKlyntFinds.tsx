"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  RiCursorLine,
  RiFlashlightLine,
  RiFocus2Line,
  RiFunctions,
  RiGovernmentLine,
  RiHashtag,
  RiRouteLine,
  RiRuler2Line,
  RiShieldCheckLine,
} from "@remixicon/react";

const ADV_MS = 5500;
const CIRC = 2 * Math.PI * 11; // ≈ 69.115

const FINDINGS = [
  {
    Icon: RiShieldCheckLine,
    title: "Trust signals",
    description:
      "Logos, testimonials, and credibility cues visible before the visitor scrolls.",
    tag: "FOLD SCAN",
    method:
      "Puppeteer scans for logo imgs, star-rating widgets, testimonial blocks and review badges — counts only those above the 768px fold boundary.",
  },
  {
    Icon: RiCursorLine,
    title: "Messaging clarity",
    description:
      "Whether headline, subline and CTA say who this is for and what happens next.",
    tag: "VERBATIM",
    method:
      "h1_text and cta_text extracted verbatim, passed to the LLM with instruction to cite the exact element before evaluating — no guessing allowed.",
  },
  {
    Icon: RiFlashlightLine,
    title: "Cognitive friction",
    description:
      "Layout and copy complexity that makes visitors think harder than they should.",
    tag: "LINK COUNT",
    method:
      "nav_link_count computed from visible top-of-page anchors, deduplicated by href. Threshold: more than 5 links flags as competing with the CTA.",
  },
  {
    Icon: RiRouteLine,
    title: "Visual hierarchy",
    description:
      "Whether the page guides the eye to headline, CTA and social proof in the right order.",
    tag: "LUMINANCE",
    method:
      "WCAG contrast ratio computed from h1_color vs hero_bg using the luminance formula. cta_border_radius and font-weight extracted for hierarchy scoring.",
  },
] as const;

const BOTTOM_ITEMS = [
  {
    Icon: RiFunctions,
    title: "Computed values",
    desc: "Real CSS values from your page — background color, font weight, contrast ratio, element spacing — not guesses from a screenshot.",
  },
  {
    Icon: RiGovernmentLine,
    title: "WCAG benchmarks",
    desc: "Every finding is checked against published accessibility and conversion standards — the same benchmarks designers and developers use.",
  },
  {
    Icon: RiHashtag,
    title: "Concrete numbers",
    desc: "Each issue states the exact value found, the benchmark it failed, and the specific change to make — no vague recommendations.",
  },
] as const;

const PANEL_STYLE: React.CSSProperties = {
  backgroundColor: "#4E85FF",
  backgroundImage: [
    "linear-gradient(rgba(255,255,255,.15) 1px,transparent 1px)",
    "linear-gradient(90deg,rgba(255,255,255,.15) 1px,transparent 1px)",
  ].join(","),
  backgroundSize: "30px 30px,30px 30px",
  boxShadow: "0 30px 60px -30px rgba(30,60,200,.5)",
  borderRadius: 24,
  overflow: "hidden",
  position: "relative",
  minHeight: 440,
};

const NOISE_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export function V2WhatKlyntFinds() {
  const [active, setActive] = useState(0);
  const [prevActive, setPrevActive] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  const activeRef = useRef(0);
  const startRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearPrevRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);

  const advance = useCallback((idx: number) => {
    const prev = activeRef.current;
    activeRef.current = idx;

    // Only set prevActive if we're actually changing the active item
    if (prev !== idx) setPrevActive(prev);
    setActive(idx);
    setProgress(0);
    startRef.current = performance.now();

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(
      () => advance((idx + 1) % FINDINGS.length),
      ADV_MS,
    );

    // Clear prevActive after the exit animation finishes
    if (clearPrevRef.current) clearTimeout(clearPrevRef.current);
    clearPrevRef.current = setTimeout(() => setPrevActive(null), 500);
  }, []);

  useEffect(() => {
    advance(0);
    const tick = () => {
      setProgress(Math.min(1, (performance.now() - startRef.current) / ADV_MS));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (clearPrevRef.current) clearTimeout(clearPrevRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [advance]);

  return (
    <section className="border-t border-lv2-border bg-lv2-cream px-6 py-[80px]">
      <div className="mx-auto max-w-[1180px]">

        {/* Header */}
        <div className="mb-12">
          <span
            className="inline-flex items-center gap-2 font-mono text-[11.5px] tracking-[.1em]"
            style={{ color: "#8C887D" }}
          >
            <RiFocus2Line size={14} style={{ color: "var(--brand-primary)" }} aria-hidden />
            WHAT KLYNT FINDS
          </span>
          <div className="mt-[18px] flex flex-wrap items-end justify-between gap-8">
            <h2 className="m-0 max-w-[17ch] text-[42px] font-bold leading-[1.05] tracking-[-0.03em]">
              Four dimensions, every one measured.
            </h2>
            <span
              className="pb-[6px] text-right font-mono text-[11.5px] leading-[1.7] tracking-[.12em]"
              style={{ color: "#8C887D" }}
            >
              47 SIGNALS COMPUTED
              <br />
              PER AUDIT
            </span>
          </div>
          <p
            className="mt-4 max-w-[54ch] text-[18px] leading-[1.55]"
            style={{ color: "#57544C" }}
          >
            Each one is measured, not guessed — and each comes back with a
            concrete example pulled straight from your page.
          </p>
        </div>

        {/* Two-column: accordion (left) + panel (right, fixed height) */}
        <div className="grid grid-cols-1 items-start gap-7 md:grid-cols-2 md:gap-12">

          {/* Accordion */}
          <div className="flex flex-col self-center">
            {FINDINGS.map(({ Icon, title, description, tag, method }, idx) => {
              const isActive = active === idx;
              const offset = isActive ? CIRC * (1 - progress) : CIRC;
              return (
                <div
                  key={title}
                  style={{
                    borderBottom:
                      idx < FINDINGS.length - 1
                        ? "1px solid #E0DBCF"
                        : undefined,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => advance(idx)}
                    className="flex w-full cursor-pointer items-center gap-[18px] border-none bg-transparent px-[6px] py-6 text-left"
                    style={{ fontFamily: "inherit", color: "inherit" }}
                  >
                    {/* Icon box */}
                    <div
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 13,
                        background: isActive ? "#1B1A17" : "#FFFFFF",
                        border: `1px solid ${isActive ? "#1B1A17" : "#E3E0D6"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "background .3s ease, border-color .3s ease",
                      }}
                    >
                      <Icon
                        size={22}
                        style={{
                          color: isActive ? "#FFFFFF" : "#1B1A17",
                          transition: "color .3s ease",
                        }}
                        aria-hidden
                      />
                    </div>

                    {/* Title */}
                    <div className="min-w-0 flex-1">
                      <h3 className="m-0 text-[22px] font-bold tracking-[-0.02em]">
                        {title}
                      </h3>
                    </div>

                    {/* Progress ring — visible only for the active item */}
                    <span style={{ flexShrink: 0, width: 30, height: 30, opacity: isActive ? 1 : 0, transition: "opacity .3s ease" }}>
                      <svg
                        width="30"
                        height="30"
                        viewBox="0 0 30 30"
                        fill="none"
                        style={{ transform: "rotate(-90deg)", display: "block" }}
                      >
                        <circle cx="15" cy="15" r="11" stroke="#DCD6C7" strokeWidth="2.5" fill="none" />
                        <circle
                          cx="15" cy="15" r="11"
                          stroke={isActive ? "#1B1A17" : "transparent"}
                          strokeWidth="2.5" strokeLinecap="round" fill="none"
                          strokeDasharray={CIRC} strokeDashoffset={offset}
                          style={{ transition: "stroke .3s ease" }}
                        />
                      </svg>
                    </span>
                  </button>

                  {/* ── Mobile inline panel (hidden on md+) ── */}
                  <div
                    className="md:hidden overflow-hidden"
                    style={{
                      maxHeight: isActive ? 600 : 0,
                      transition: "max-height 0.35s cubic-bezier(.22,.61,.36,1)",
                    }}
                  >
                    <div className="pb-5">
                      <div
                        style={{
                          backgroundColor: "#4E85FF",
                          backgroundImage: PANEL_STYLE.backgroundImage,
                          backgroundSize: PANEL_STYLE.backgroundSize,
                          borderRadius: 16,
                          padding: 20,
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        {/* Noise overlay */}
                        <div
                          aria-hidden
                          style={{
                            position: "absolute", inset: 0, zIndex: 1,
                            pointerEvents: "none", mixBlendMode: "overlay",
                            opacity: 0.16, backgroundImage: `url("${NOISE_URL}")`,
                          }}
                        />
                        {/* Card */}
                        <div style={{ position: "relative", zIndex: 2 }}>
                          <div
                            style={{
                              background: "#FBFAF6", borderRadius: 12,
                              padding: "20px 22px", display: "flex",
                              flexDirection: "column", gap: 12,
                              boxShadow: "0 12px 30px -12px rgba(10,30,160,.55)",
                            }}
                          >
                            <p
                              className="m-0 font-sans text-[16px] font-normal leading-[1.45] tracking-[-0.01em]"
                              style={{ color: "#1B1A17" }}
                            >
                              {description}
                            </p>
                            <div style={{ borderTop: "1px solid #E8E4DC", paddingTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                              <div className="flex items-center justify-between gap-3">
                                <span
                                  className="inline-flex items-center gap-2 font-mono text-[10.5px] tracking-[.12em]"
                                  style={{ color: "var(--brand-primary)" }}
                                >
                                  <RiRuler2Line size={13} aria-hidden />
                                  HOW IT&rsquo;S MEASURED
                                </span>
                                <span className="font-mono text-[10px] tracking-[.07em]" style={{ color: "#B7B2A4" }}>
                                  {tag}
                                </span>
                              </div>
                              <p className="m-0 font-mono text-[13px] leading-[1.75]" style={{ color: "#3F3B33" }}>
                                {method}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* ─────────────────────────────────────────────────────── */}

                </div>
              );
            })}
          </div>

          {/* Blue panel — desktop only */}
          <div style={PANEL_STYLE} className="self-start hidden md:block">
            {/* Noise texture overlay */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 1,
                pointerEvents: "none",
                mixBlendMode: "overlay",
                opacity: 0.16,
                backgroundImage: `url("${NOISE_URL}")`,
              }}
            />

            {/* Absolutely fills panel, centers the card stack vertically */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "56px",
              }}
            >
              {/* CSS-grid stacking: all cards in cell 1/1 so they overlay */}
              <div style={{ display: "grid" }}>
                {FINDINGS.map(({ description, tag, method }, idx) => {
                  const isActive = active === idx;
                  const isPrev = prevActive === idx;

                  // Active card: slides up from below + fades in
                  // Leaving card: scales down + fades out (zoom-out)
                  // Idle cards: waiting below, invisible
                  const opacity = isActive ? 1 : 0;
                  const transform = isActive
                    ? "translateY(0px) scale(1)"
                    : isPrev
                      ? "translateY(0px) scale(0.93)"
                      : "translateY(18px) scale(1)";
                  const transition = isActive
                    ? "opacity .42s cubic-bezier(.22,.61,.36,1), transform .42s cubic-bezier(.22,.61,.36,1)"
                    : isPrev
                      ? "opacity .32s ease, transform .32s ease"
                      : "none";

                  return (
                    <div
                      key={tag}
                      style={{
                        gridArea: "1 / 1",
                        opacity,
                        transform,
                        pointerEvents: isActive ? "auto" : "none",
                        transition,
                      }}
                    >
                      <div
                        style={{
                          background: "#FBFAF6",
                          borderRadius: 16,
                          padding: "26px 28px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 14,
                          boxShadow: "0 16px 38px -16px rgba(10,30,160,.55)",
                        }}
                      >
                        {/* Accordion description in Familjen, larger than the method text */}
                        <p
                          className="m-0 font-sans text-[17px] font-normal leading-[1.45] tracking-[-0.01em]"
                          style={{ color: "#1B1A17" }}
                        >
                          {description}
                        </p>
                        <div
                          style={{
                            borderTop: "1px solid #E8E4DC",
                            paddingTop: 14,
                            display: "flex",
                            flexDirection: "column",
                            gap: 14,
                          }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span
                              className="inline-flex items-center gap-2 font-mono text-[10.5px] tracking-[.12em]"
                              style={{ color: "var(--brand-primary)" }}
                            >
                              <RiRuler2Line size={13} aria-hidden />
                              HOW IT&rsquo;S MEASURED
                            </span>
                            <span
                              className="font-mono text-[10px] tracking-[.07em]"
                              style={{ color: "#B7B2A4" }}
                            >
                              {tag}
                            </span>
                          </div>
                          <p
                            className="m-0 font-mono text-[14px] leading-[1.75]"
                            style={{ color: "#3F3B33" }}
                          >
                            {method}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom 3-column grid */}
        <div
          className="mt-[144px] grid grid-cols-1 overflow-hidden rounded-[16px] md:grid-cols-3"
          style={{ border: "1px solid #E3E0D6", background: "#FFFFFF" }}
        >
          {BOTTOM_ITEMS.map(({ Icon, title, desc }, i) => (
            <div
              key={title}
              style={{
                padding: "28px 26px",
                borderLeft: i > 0 ? "1px solid #E3E0D6" : undefined,
              }}
            >
              <Icon size={20} style={{ color: "#1B1A17" }} aria-hidden />
              <h3 className="mb-[7px] mt-[14px] text-[17px] font-semibold">
                {title}
              </h3>
              <p className="m-0 text-[14px] leading-[1.5]" style={{ color: "#57544C" }}>
                {desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
