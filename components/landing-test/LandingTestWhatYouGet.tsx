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
  "bg-[linear-gradient(90deg,rgba(6,28,47,0.04)_1px,transparent_1px)] bg-[length:24px_100%]";

function FeatureVisual({ id }: { id: string }) {
  if (id === "ux-diagnostics") {
    return (
      <div className="w-[180px] rounded-2xl border border-[rgba(6,28,47,0.06)] bg-white p-3 shadow-sm">
        <div className="h-2 w-16 rounded-full bg-[#E5E7EB]" />
        <div className="mt-2 h-2.5 w-[85%] rounded-full bg-[#E5E7EB]" />
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-500">
            -12% conversion
          </span>
          <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-medium text-[#667085]">
            Weak CTA
          </span>
        </div>
      </div>
    );
  }

  if (id === "prioritized-fixes") {
    return (
      <div className="w-[180px] space-y-2">
        {[
          ["Hero clarity", "bg-red-400", "max-w-[120px]"],
          ["CTA hierarchy", "bg-orange-400", "max-w-[100px]"],
          ["Trust signals", "bg-sky-300", "max-w-[140px]"],
        ].map(([label, color, width]) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`h-1.5 flex-1 rounded-full bg-[#E5E7EB] ${width}`}>
              <div className={`h-full rounded-full ${color}`} style={{ width: "100%" }} />
            </div>
            <span className="w-20 text-right text-[10px] text-[#6B7280]">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (id === "copy-rewrites") {
    return (
      <div className="w-[180px] rounded-2xl border border-sky-200 bg-sky-50/70 p-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#2563EB] px-2 py-0.5 text-[10px] font-semibold text-white">
            AI Suggestion
          </span>
          <span className="rounded-full border border-sky-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-sky-700">
            +15%
          </span>
        </div>
        <p className="mt-2 text-[10px] leading-snug text-[#6B7280]">
          iPhone 17 Pro — Designed for professional photographers and...
        </p>
      </div>
    );
  }

  return (
    <div className="w-[180px] rounded-2xl border border-[rgba(6,28,47,0.06)] bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#061C2F]">Clarity Report</span>
        <span className="rounded bg-[#F5F7FA] px-1.5 py-0.5 text-[9px] font-semibold text-[#6B7280]">
          PDF
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-emerald-400 text-[12px] font-semibold text-emerald-600">
          95
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="h-1.5 rounded-full bg-emerald-300" />
          <div className="h-1.5 w-[80%] rounded-full bg-emerald-200" />
        </div>
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
                className={`grid grid-cols-1 items-center gap-6 overflow-hidden rounded-[20px] border border-[rgba(6,28,47,0.06)] p-6 sm:grid-cols-[1fr_auto] md:rounded-[24px] md:p-8 ${cardPattern}`}
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-5 text-[20px] font-semibold tracking-[-0.03em] text-[#061C2F] md:text-[22px]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 max-w-[280px] text-[15px] leading-6 text-[#6B7280]">
                    {feature.description}
                  </p>
                </div>

                <div className="flex justify-start sm:justify-end">
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
