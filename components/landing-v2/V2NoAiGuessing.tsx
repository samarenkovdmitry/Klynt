import { RiCheckboxCircleLine, RiFunctions, RiGovernmentLine, RiHashtag } from "@remixicon/react";

const FEATURES = [
  {
    icon: RiFunctions,
    title: "Computed values",
    body: "Real CSS values from your page — background color, font weight, contrast ratio, element spacing — not guesses from a screenshot.",
  },
  {
    icon: RiGovernmentLine,
    title: "WCAG benchmarks",
    body: "Every finding is checked against published accessibility and conversion standards — the same benchmarks designers and developers use.",
  },
  {
    icon: RiHashtag,
    title: "Concrete numbers",
    body: "Each issue states the exact value found, the benchmark it failed, and the specific change to make — no vague recommendations.",
  },
];

export function V2NoAiGuessing() {
  return (
    <section className="border-t border-lv2-border bg-white px-6 py-[96px] md:px-[72px] md:py-[104px]">
      <div className="mx-auto max-w-[1080px]">
        <div className="mb-11 flex flex-wrap items-end justify-between gap-[56px]">
          <div className="max-w-[560px]">
            <span className="mb-[18px] inline-flex items-center gap-2 font-mono text-[11.5px] tracking-[.1em] text-lv2-green">
              <RiCheckboxCircleLine size={14} aria-hidden />
              NO AI GUESSING
            </span>
            <h2 className="mb-[14px] text-[38px] font-bold leading-[1.08] tracking-[-0.03em]">
              Not a model squinting at a screenshot.
            </h2>
            <p className="max-w-[50ch] text-[18px] leading-[1.55] text-v2-ink-secondary">
              Klynt reads your live page and computes real values. Every finding states the number,
              the benchmark it failed, and the fix.
            </p>
          </div>

          <div className="shrink-0 text-right">
            <div className="font-mono text-[128px] font-semibold leading-[.78] tracking-[-0.05em] text-v2-dark md:text-[104px] lg:text-[128px]">
              47
            </div>
            <span className="mt-3 block font-mono text-[11.5px] leading-[1.6] tracking-[.12em] text-v2-ink-muted">
              SIGNALS COMPUTED
              <br />
              NOT GUESSED
            </span>
          </div>
        </div>

        <div className="grid overflow-hidden rounded-[16px] border border-lv2-card-border lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`px-[26px] py-[28px] ${i > 0 ? "border-t border-lv2-card-border lg:border-l lg:border-t-0" : ""}`}
              >
                <Icon size={20} className="text-v2-dark" aria-hidden />
                <h3 className="mb-[7px] mt-[14px] text-[17px] font-semibold">{f.title}</h3>
                <p className="text-[14px] leading-[1.5] text-v2-ink-secondary">{f.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
