import {
  LANDING_UPDATE_CONTAINER,
  WHAT_YOU_GET_FEATURES,
} from "@/lib/landing-update-content";

import {
  UPDATE_EYEBROW,
  UPDATE_HEADLINE,
  UPDATE_SECTION,
} from "./landingUpdateStyles";

const cardPattern =
  "bg-[linear-gradient(90deg,rgba(6,28,47,0.035)_1px,transparent_1px)] bg-[length:40px_100%]";

function FeatureVisual({ id }: { id: string }) {
  if (id === "ux-diagnostics") {
    return (
      <div className="w-[200px] rounded-[20px] border border-[rgba(6,28,47,0.08)] bg-white p-4 shadow-[0_8px_24px_rgba(6,28,47,0.08)]">
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
      <div className="w-[200px] space-y-3">
        {[
          { label: "Hero clarity", width: "w-[88px]", color: "bg-[#F87171]" },
          { label: "CTA hierarchy", width: "w-[72px]", color: "bg-[#FB923C]" },
          { label: "Trust signals", width: "w-[120px]", color: "bg-[#94A3B8]" },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4">
            <div className={`h-2 rounded-full ${item.color} ${item.width}`} />
            <span className="shrink-0 text-[11px] text-[#6B7280]">{item.label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (id === "copy-rewrites") {
    return (
      <div className="w-[200px] rounded-[20px] border border-[#BFDBFE] bg-[#F0F7FF] p-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#2563EB] px-2.5 py-1 text-[11px] font-semibold text-white">
            AI Suggestion
          </span>
          <span className="rounded-full border border-[#BFDBFE] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#2563EB]">
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
    <div className="w-[220px] rounded-[20px] border border-[rgba(6,28,47,0.08)] bg-white p-4 shadow-[0_8px_24px_rgba(6,28,47,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] font-semibold text-[#061C2F]">Clarity Report</span>
        <span className="rounded-md bg-[#F5F7FA] px-2 py-0.5 text-[10px] font-semibold text-[#6B7280]">
          PDF
        </span>
      </div>

      <div className="mt-4 flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[5px] border-[#34D399] text-[16px] font-semibold text-[#059669]">
          95
        </div>
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-2 w-full rounded-full bg-[#E5E7EB]" />
          <div className="h-2 w-[75%] rounded-full bg-[#E5E7EB]" />
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {[
          { label: "Hero clarity", width: "85%" },
          { label: "CTA hierarchy", width: "68%" },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-[10px] text-[#6B7280]">{item.label}</p>
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
          <p className={UPDATE_EYEBROW}>What you get</p>
          <h2 className={`mt-4 ${UPDATE_HEADLINE}`}>
            Built to make landing clarity obvious
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:mt-16 md:grid-cols-2">
          {WHAT_YOU_GET_FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.id}
                className={`relative grid min-h-[240px] grid-cols-1 items-stretch gap-6 overflow-hidden rounded-[24px] border border-[rgba(6,28,47,0.06)] p-8 sm:grid-cols-[1fr_auto] ${cardPattern}`}
              >
                <div className="flex min-w-0 flex-col">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
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
                    "flex items-end justify-start sm:justify-end",
                    feature.id === "pdf-export" ? "sm:-mb-2 sm:-mr-2" : "",
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
