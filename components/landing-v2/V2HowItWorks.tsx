import { RiArrowRightLine, RiRouteLine } from "@remixicon/react";

const STEPS = [
  {
    num: "01",
    title: "Paste your URL",
    body: "Drop in any landing page. Klynt loads it instantly — no account, no code snippet, nothing to install.",
  },
  {
    num: "02",
    title: "We scan 47 signals",
    body: "Six categories — messaging, trust, hierarchy, friction, copy and technical — checked against conversion benchmarks.",
  },
  {
    num: "03",
    title: "Get a prioritised fix list",
    body: "Every issue with a concrete before → after rewrite, ranked by impact and ready to export.",
    hasArrow: true,
  },
];

const STATS = [
  { label: "47 SIGNALS", highlight: true },
  { label: "6 CATEGORIES", highlight: true },
  { label: "RANKED BY IMPACT", highlight: true },
  { label: "NO AI GUESSING", green: true },
];

export function V2HowItWorks() {
  return (
    <section className="border-t border-lv2-border px-6 py-[96px] md:px-[72px] md:py-[104px]">
      <div className="mx-auto max-w-[1080px]">
        <div className="mb-[54px] max-w-[680px]">
          <span className="mb-[18px] inline-flex items-center gap-2 font-mono text-[11.5px] tracking-[.1em] text-v2-ink-muted">
            <RiRouteLine size={14} className="text-lv2-green" aria-hidden />
            HOW IT WORKS
          </span>
          <h2 className="mb-4 text-[42px] font-bold leading-[1.05] tracking-[-0.03em]">
            From URL to fix list in about a minute.
          </h2>
          <p className="max-w-[52ch] text-[18px] leading-[1.55] text-v2-ink-secondary">
            No signup, no install. Paste a link and Klynt runs the same measurable checks every
            time — then hands back exactly what to change.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="relative overflow-hidden rounded-[16px] border border-lv2-card-border bg-white px-[30px] pb-[32px] pt-[30px] shadow-[0_1px_2px_rgba(27,26,23,.03)]"
            >
              <span className="mb-[22px] block font-mono text-[46px] font-semibold leading-none tracking-[-0.04em] text-lv2-step-num">
                {step.num}
              </span>
              <h3 className="mb-[9px] text-[20px] font-semibold tracking-[-0.015em]">{step.title}</h3>
              <p className="text-[15px] leading-[1.55] text-v2-ink-secondary">
                {step.hasArrow ? (
                  <>
                    Every issue with a concrete before{" "}
                    <RiArrowRightLine
                      size={13}
                      className="inline-block align-[-1px] text-v2-ink-faint"
                      aria-hidden
                    />{" "}
                    after rewrite, ranked by impact and ready to export.
                  </>
                ) : (
                  step.body
                )}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-[34px] flex flex-wrap items-center gap-3 font-mono text-[11.5px] tracking-[.06em]">
          {STATS.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-3">
              <span className={s.green ? "text-lv2-green" : "text-v2-ink-secondary"}>
                {s.label}
              </span>
              {i < STATS.length - 1 && <span className="text-lv2-border">·</span>}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
