import {
  LANDING_UPDATE_CONTAINER,
  WHAT_YOU_GET_FEATURES,
} from "@/lib/landing-update-content";

import {
  UPDATE_CARD_STRIPE_OVERLAY,
  UPDATE_SECTION,
  UPDATE_SECTION_LABEL,
  UPDATE_SECTION_TITLE,
} from "./landingUpdateStyles";

const featurePreviewCard =
  "w-full rounded-[20px] border border-[rgba(6,28,47,0.08)] bg-white p-4 lg:w-[245px]";

const pdfExportCard =
  "w-full rounded-t-[20px] rounded-b-none border border-[rgba(6,28,47,0.08)] border-b-0 bg-white p-4 lg:w-[180px]";

function ScoreRing95() {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const fillPercent = 0.95;

  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg
        className="absolute inset-0 h-full w-full -rotate-90"
        viewBox="0 0 56 56"
        aria-hidden
      >
        <circle
          cx="28"
          cy="28"
          r={radius}
          stroke="#E5E7EB"
          strokeWidth="3"
          fill="transparent"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          stroke="#34D399"
          strokeWidth="3"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fillPercent)}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[20px] font-medium text-[#059669]">
        95
      </span>
    </div>
  );
}

function FeatureVisual({ id }: { id: string }) {
  if (id === "ux-diagnostics") {
    return (
      <div className={`${featurePreviewCard} h-[110px]`}>
        <div className="space-y-2">
          <div className="h-2 w-[72px] rounded-full bg-[#E5E7EB]" />
          <div className="h-2.5 w-full rounded-full bg-[#E5E7EB]" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-red-200 bg-[#FEF2F2] px-2.5 py-1 text-[11px] font-semibold text-[#EF4444]">
            -12% conversion
          </span>
          <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-medium text-[#667085]">
            Weak CTA
          </span>
        </div>
      </div>
    );
  }

  if (id === "prioritized-fixes") {
    return (
      <div className={`${featurePreviewCard} h-[113px]`}>
        <div className="space-y-3">
          {[
            { label: "Hero clarity", width: "20%", color: "bg-[#F87171]" },
            { label: "CTA hierarchy", width: "45%", color: "bg-[#FB923C]" },
            { label: "Trust signals", width: "90%", color: "bg-[#94A3B8]" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-[#F5F5F5]">
                <div
                  className={`h-full rounded-full ${item.color}`}
                  style={{ width: item.width }}
                />
              </div>
              <span className="w-[80px] shrink-0 text-right text-[11px] text-[#6B7280]">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (id === "copy-rewrites") {
    return (
      <div className="h-[110px] w-full rounded-[20px] border border-[var(--nordic-border)] bg-[var(--nordic-bg)] p-4 lg:w-[245px]">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full border border-[#BAE7FD] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#006BA6]">
            AI Suggestion
          </span>
          <span className="rounded-full border border-[var(--nordic-border)] bg-[var(--nordic-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--brand-primary)]">
            +15%
          </span>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-[#374151]">
          iPhone 17 Pro — Designed for professional photographers and...
        </p>
      </div>
    );
  }

  return (
    <div className={pdfExportCard}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] font-semibold text-[#061C2F]">Clarity Report</span>
        <span className="rounded-md border border-[#DCE2E7] bg-[#F5F7FA] px-2 py-0.5 text-[10px] font-semibold text-[#6B7280]">
          PDF
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <ScoreRing95 />
        <div className="flex-1 space-y-2">
          <div className="h-[5px] w-full rounded-full bg-[#E5E7EB]" />
          <div className="h-[5px] w-[75%] rounded-full bg-[#E5E7EB]" />
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {[
          { label: "Hero clarity", width: "85%" },
          { label: "CTA hierarchy", width: "68%" },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-[10px] font-medium text-[#6B7280]">{item.label}</p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#E5E7EB]">
              <div
                className="h-full rounded-full bg-[#34D399]"
                style={{ width: item.width }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingTestWhatYouGet() {
  return (
    <section className={`${UPDATE_SECTION} bg-white`}>
      <div className={LANDING_UPDATE_CONTAINER}>
        <div className="mx-auto max-w-[760px] text-center">
          <p className={UPDATE_SECTION_LABEL}>What you get</p>
          <h2 className={UPDATE_SECTION_TITLE}>Built to make landing clarity obvious</h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:mt-16 lg:grid-cols-2">
          {WHAT_YOU_GET_FEATURES.map((feature) => {
            const Icon = feature.icon;
            const isPdfExport = feature.id === "pdf-export";

            return (
              <article
                key={feature.id}
                className="relative grid min-h-[240px] grid-cols-1 items-stretch gap-6 overflow-hidden rounded-[24px] border border-[rgba(6,28,47,0.06)] bg-[#FAFBFC] p-5 lg:grid-cols-[1fr_auto] md:p-8"
              >
                <div className={UPDATE_CARD_STRIPE_OVERLAY} aria-hidden />

                <div className="relative z-10 flex min-w-0 flex-col">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-5 text-[22px] font-semibold tracking-[-0.03em] text-[#061C2F]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 max-w-[280px] text-[15px] leading-6 text-[#6B7280]">
                    {feature.description}
                  </p>
                </div>

                <div
                  className={[
                    "relative z-10 flex items-end justify-start lg:justify-end",
                    isPdfExport
                      ? "-mb-5 self-end md:-mb-8 md:-mr-8 md:ml-8 md:-translate-x-[30px]"
                      : "",
                  ].join(" ")}
                >
                  <FeatureVisual id={feature.id} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
