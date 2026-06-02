import type { ReactNode } from "react";
import {
  ANALYSIS_BENTO_CARDS,
  type BentoVariant,
} from "@/lib/landing-content";
import {
  BENTO_DESCRIPTION_CLASS,
  BENTO_TITLE_CLASS,
} from "@/components/landing/landingStyles";

const pillStyles: Record<BentoVariant, string> = {
  red: "border-[#F9D5D5] bg-[#FFEFEF] text-[#FF5A4F]",
  emerald: "border-emerald-200 bg-[#ECFDF5] text-[#10B981]",
};

const visualAreaStyles: Record<BentoVariant, string> = {
  red: "bg-[#FFF5F5]",
  emerald: "bg-emerald-50",
};

function CategoryPill({
  variant,
  children,
}: {
  variant: BentoVariant;
  children: ReactNode;
}) {
  return (
    <div
      className={`inline-flex w-fit rounded-full border px-3 py-1 text-[12px] font-semibold ${pillStyles[variant]}`}
    >
      {children}
    </div>
  );
}

function BentoVisualUxIssues() {
  return (
    <div className="w-full max-w-[260px] rounded-2xl border border-[rgba(6,28,47,0.06)] bg-white p-3.5 shadow-sm">
      <div className="h-2 w-16 rounded-full bg-[#E5E7EB]" />
      <div className="mt-2.5 h-2.5 w-[85%] rounded-full bg-[#E5E7EB]" />
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded-full border border-[#F9D5D5] bg-[#FFEFEF] px-2 py-0.5 text-[10px] font-semibold text-[#FF5A4F]">
          -12% conversion
        </span>
        <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-medium text-[#667085]">
          Weak CTA
        </span>
      </div>
    </div>
  );
}

function ImprovementRow({ rank, barWidth }: { rank: number; barWidth: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 shadow-sm">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
        {rank}
      </div>
      <div className="min-w-0 flex-1">
        <div
          className={`h-2 w-full rounded-full bg-[#E5E7EB] ${barWidth}`}
        />
      </div>
      <span className="shrink-0 text-[10px] font-semibold text-emerald-600">
        +15%
      </span>
    </div>
  );
}

function BentoVisualImprovements() {
  return (
    <div className="w-full max-w-[260px] space-y-2">
      <ImprovementRow rank={1} barWidth="max-w-[120px]" />
      <ImprovementRow rank={2} barWidth="max-w-[100px]" />
    </div>
  );
}

function BentoVisualCopyRefinement() {
  return (
    <div className="flex w-full max-w-[260px] flex-col justify-center gap-2">
      <div className="rounded-xl bg-neutral-50 px-3 py-2.5 shadow-sm">
        <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
          Before
        </p>
        <p className="mt-1 text-[11px] leading-snug text-neutral-600">
          Turn waiting into watching.
        </p>
      </div>

      <div className="rounded-xl border border-emerald-200 bg-[#ECFDF5] px-3 py-2.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
            After
          </p>
          <span className="shrink-0 rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            +15% clarity
          </span>
        </div>
        <p className="mt-1 text-[11px] font-medium leading-snug text-[var(--ink-primary)]">
          Mac screensavers that keep your display alive.
        </p>
      </div>
    </div>
  );
}

function BentoVisual({ id }: { id: string }) {
  switch (id) {
    case "ux-issues":
      return <BentoVisualUxIssues />;
    case "improvements":
      return <BentoVisualImprovements />;
    case "copy-refinement":
      return <BentoVisualCopyRefinement />;
    default:
      return null;
  }
}

export function AnalysisBentoGrid() {
  return (
    <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3">
      {ANALYSIS_BENTO_CARDS.map((card) => (
        <article
          key={card.id}
          className={[
            "flex flex-col overflow-hidden rounded-[28px] bg-white",
            card.bordered ? "border border-[rgba(6,28,47,0.06)]" : "",
          ].join(" ")}
        >
          <div className="flex flex-1 flex-col p-6 pb-5">
            <CategoryPill variant={card.variant}>{card.pillLabel}</CategoryPill>
            <h3 className={BENTO_TITLE_CLASS}>{card.title}</h3>
            <p className={BENTO_DESCRIPTION_CLASS}>{card.description}</p>
          </div>

          <div
            className={`flex h-[148px] items-center justify-center px-5 ${visualAreaStyles[card.variant]}`}
          >
            <BentoVisual id={card.id} />
          </div>
        </article>
      ))}
    </div>
  );
}
