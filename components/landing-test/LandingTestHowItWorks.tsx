import {
  StepAddPageVisual,
  StepAnalyzeVisual,
  StepReportVisual,
} from "./LandingStepVisuals";
import {
  LANDING_CONTAINER,
  LANDING_EYEBROW,
  LANDING_LEAD,
  LANDING_SECTION,
  LANDING_TITLE,
} from "./landingPageStyles";

const STEPS = [
  {
    step: "1",
    title: "Add your page",
    description: "Paste a URL or upload a screenshot, any landing or marketing page.",
    Visual: StepAddPageVisual,
  },
  {
    step: "2",
    title: "Klynt analyzes UX",
    description:
      "Layout, messaging, trust signals, and conversion flow, only from what's visible on screen.",
    Visual: StepAnalyzeVisual,
  },
  {
    step: "3",
    title: "Ship improvements",
    description:
      "Prioritized issues, plain-language explanations, and copy suggestions you can act on.",
    Visual: StepReportVisual,
  },
] as const;

export function LandingTestHowItWorks() {
  return (
    <section className={LANDING_SECTION} aria-labelledby="how-heading">
      <div className={LANDING_CONTAINER}>
        <div className="mx-auto max-w-[640px] text-center">
          <p className={LANDING_EYEBROW}>How it works</p>
          <h2 id="how-heading" className={`${LANDING_TITLE} mx-auto max-w-[640px] text-center`}>
            From URL to actionable report in minutes
          </h2>
          <p className={`${LANDING_LEAD} mx-auto max-w-[540px]`}>
            No setup, no account. Most analyses finish in under a minute.
          </p>
        </div>

        <ol className="mt-12 grid grid-cols-1 gap-0 lg:mt-16 lg:grid-cols-3 lg:items-stretch lg:gap-8">
          {STEPS.map((item, index) => {
            const Visual = item.Visual;

            return (
              <li
                key={item.step}
                className={[
                  "flex flex-col border-t border-white/[0.06] py-8 lg:border-t-0 lg:py-0",
                  index > 0 ? "lg:border-l lg:border-white/[0.06] lg:pl-8" : "",
                ].join(" ")}
              >
                <span className="text-[13px] font-medium tabular-nums text-white/30">
                  {item.step}
                </span>
                <h3 className="mt-3 text-[17px] font-medium leading-[24px] text-white md:text-[18px]">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-[320px] text-[14px] leading-[22px] text-white/50 md:text-[15px] md:leading-[24px]">
                  {item.description}
                </p>
                <div className="mt-6 lg:mt-auto lg:pt-8">
                  <Visual />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
