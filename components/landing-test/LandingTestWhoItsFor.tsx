"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import {
  LANDING_CONTAINER,
  LANDING_EYEBROW,
  LANDING_LEAD,
  LANDING_SECTION,
  LANDING_TITLE,
} from "./landingPageStyles";

const ROTATE_MS = 6500;

type PersonaId = "founder" | "marketer" | "designer";

type Persona = {
  id: PersonaId;
  label: string;
  description: string;
};

function GraphicShell({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "mx-auto w-[min(100%,420px)] overflow-hidden rounded-2xl md:w-[440px]",
        "border border-white/[0.1] bg-[#1A1A1D]",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_16px_48px_rgba(0,0,0,0.22)]",
        className,
      ].join(" ")}
      aria-hidden
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5 md:px-5">
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/35">
          {label}
        </span>
        <span className="h-2 w-2 rounded-full bg-indigo-400/80 shadow-[0_0_8px_rgba(129,140,248,0.55)]" />
      </div>
      <div className="px-4 py-4 md:px-5 md:py-5">{children}</div>
    </div>
  );
}

function FounderGraphic() {
  return (
    <GraphicShell label="Score potential">
      <div className="flex items-end justify-center gap-3 tabular-nums">
        <div className="text-right">
          <p className="text-[11px] font-medium text-white/30">Now</p>
          <p className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.04em] text-white/40 md:text-[32px]">
            6.1
          </p>
        </div>
        <svg
          width="18"
          height="10"
          viewBox="0 0 16 8"
          fill="none"
          className="mb-2 shrink-0 text-white/25"
          aria-hidden
        >
          <path
            d="M0 4h10m0 0l-2.5-2.5M10 4l-2.5 2.5"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div>
          <p className="text-[11px] font-medium text-indigo-300/60">Target</p>
          <p className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.04em] text-indigo-300 md:text-[32px]">
            8.3
          </p>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] text-white/30">
          <span>Gap closed if top fixes ship</span>
          <span className="font-medium tabular-nums text-indigo-300/80">+2.2</span>
        </div>
        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="relative h-full w-[83%] rounded-full bg-gradient-to-r from-white/20 to-indigo-400" />
        </div>
      </div>
    </GraphicShell>
  );
}

function MarketerGraphic() {
  return (
    <GraphicShell label="Message alignment">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 md:p-3.5">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-white/30">Ad</p>
          <p className="mt-2 text-[13px] font-medium leading-snug tracking-[-0.01em] text-white/85 md:text-[14px]">
            Start free trial
          </p>
        </div>
        <div className="rounded-xl border border-[#F87171]/25 bg-[#F87171]/[0.06] p-3 md:p-3.5">
          <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#FCA5A5]/80">
            Hero
          </p>
          <p className="mt-2 text-[13px] font-medium leading-snug tracking-[-0.01em] text-white/45 line-through decoration-[#F87171]/40 md:text-[14px]">
            Start for free
          </p>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] font-medium text-white/30">
        Intent mismatch flagged
      </p>
    </GraphicShell>
  );
}

function DesignerGraphic() {
  return (
    <GraphicShell label="Deliverable">
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03]">
        <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
        </div>
        <div className="p-3 md:p-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[11px] font-semibold text-white/80 md:text-[12px]">
              folk.app audit
            </p>
            <span className="shrink-0 rounded border border-white/[0.1] bg-white/[0.05] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/40">
              PDF
            </span>
          </div>
          <div className="mt-2.5 space-y-1.5">
            <div className="h-1 w-full rounded-full bg-white/[0.08]" />
            <div className="h-1 w-4/5 rounded-full bg-white/[0.05]" />
            <div className="h-1 w-3/5 rounded-full bg-indigo-400/70" />
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-white/30">
        <span>Share link</span>
        <span className="font-medium text-white/45">Ready to send</span>
      </div>
    </GraphicShell>
  );
}

const PERSONA_GRAPHICS: Record<PersonaId, () => React.JSX.Element> = {
  founder: FounderGraphic,
  marketer: MarketerGraphic,
  designer: DesignerGraphic,
};

const PERSONAS: Persona[] = [
  {
    id: "founder",
    label: "Founders",
    description:
      "Ship the page, then fix what blocks signups with a ranked list of UX and messaging gaps, so you do not burn another week on the wrong tweak.",
  },
  {
    id: "marketer",
    label: "Marketers",
    description:
      "Make paid traffic match what visitors see. Audit hero copy, proof, and CTA the way a high-intent visitor reads them in five seconds.",
  },
  {
    id: "designer",
    label: "Product teams",
    description:
      "Replace taste debates with a shareable report: scores, rewrites, and visual fixes in one link or PDF for stakeholders and clients.",
  },
];

export function LandingTestWhoItsFor() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const select = useCallback((index: number) => {
    setActiveIndex((index + PERSONAS.length) % PERSONAS.length);
  }, []);

  useEffect(() => {
    if (paused) return undefined;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PERSONAS.length);
    }, ROTATE_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, activeIndex]);

  return (
    <section
      className={LANDING_SECTION}
      aria-labelledby="who-heading"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className={`${LANDING_CONTAINER} mx-auto max-w-[720px] text-center`}>
        <p className={LANDING_EYEBROW}>Who it&apos;s for</p>

        <div
          className="mt-3 flex flex-wrap items-baseline justify-center gap-x-5 gap-y-2 md:gap-x-8"
          role="tablist"
          aria-label="Audience types"
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowDown") {
              event.preventDefault();
              select(activeIndex + 1);
            }
            if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
              event.preventDefault();
              select(activeIndex - 1);
            }
          }}
        >
          {PERSONAS.map((persona, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={persona.id}
                type="button"
                role="tab"
                id={`who-tab-${persona.id}`}
                aria-selected={isActive}
                aria-controls={`who-panel-${persona.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => select(index)}
                className={[
                  LANDING_TITLE,
                  "mt-0 max-w-none transition-[opacity,color] duration-300",
                  isActive ? "text-white" : "text-white/25 hover:text-white/45",
                ].join(" ")}
              >
                {persona.label}
              </button>
            );
          })}
        </div>

        <h2 id="who-heading" className="sr-only">
          Who Klynt is for
        </h2>

        <div className="mt-8 grid md:mt-10">
          {PERSONAS.map((persona, index) => {
            const isActive = index === activeIndex;
            const Graphic = PERSONA_GRAPHICS[persona.id];

            return (
              <div
                key={persona.id}
                className={[
                  "col-start-1 row-start-1 transition-opacity duration-700 ease-out motion-reduce:transition-none",
                  isActive ? "z-[1] opacity-100" : "pointer-events-none opacity-0",
                ].join(" ")}
                aria-hidden={!isActive}
                role="tabpanel"
                id={`who-panel-${persona.id}`}
                aria-labelledby={`who-tab-${persona.id}`}
              >
                <div>
                  <Graphic />
                </div>
                <p className={`${LANDING_LEAD} mx-auto mt-7 max-w-[540px] md:mt-8`}>
                  {persona.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
