import {
  EDITORIAL_BODY,
  EDITORIAL_CONTAINER,
  EDITORIAL_LABEL,
  EDITORIAL_SECTION,
} from "./landingEditorialStyles";

const STEPS = [
  {
    number: "01",
    title: "Paste a URL",
    description: "Analyze any landing page or marketing site.",
  },
  {
    number: "02",
    title: "Review findings",
    description: "Get UX issues, explanations, and impact estimates.",
  },
  {
    number: "03",
    title: "Improve",
    description: "Apply suggested fixes and stronger copy.",
  },
] as const;

export function LandingTestHowItWorks() {
  return (
    <section className={EDITORIAL_SECTION} aria-labelledby="how-it-works-heading">
      <div className={EDITORIAL_CONTAINER}>
        <p className={EDITORIAL_LABEL}>How it works</p>
        <h2 id="how-it-works-heading" className="sr-only">
          How it works
        </h2>

        <ol className="mt-10 lg:mt-14">
          {STEPS.map((step, index) => (
            <li
              key={step.number}
              className={[
                "grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-white/[0.06] py-8 md:grid-cols-[72px_1fr] md:gap-x-10 md:py-10",
                index === STEPS.length - 1 ? "pb-0" : "",
              ].join(" ")}
            >
              <span
                className="pt-0.5 text-[13px] font-medium tabular-nums leading-none text-white/30 md:text-[14px]"
                aria-hidden
              >
                {step.number}
              </span>
              <div>
                <h3 className="text-[18px] font-medium leading-[24px] text-white md:text-[20px] md:leading-[28px]">
                  {step.title}
                </h3>
                <p className={`mt-2 max-w-[480px] ${EDITORIAL_BODY}`}>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
