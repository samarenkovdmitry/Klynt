import {
  LANDING_CONTAINER,
  LANDING_EYEBROW,
  LANDING_LEAD,
  LANDING_SECTION,
  LANDING_TITLE,
} from "./landingPageStyles";

const DIMENSIONS = [
  {
    title: "Trust signals",
    description: "Proof, credibility, and reassurance that help visitors commit.",
  },
  {
    title: "Decision clarity",
    description: "Whether the offer and next step are obvious on first scan.",
  },
  {
    title: "Cognitive friction",
    description: "Layout and copy that make the page harder to parse than it should be.",
  },
  {
    title: "Conversion flow",
    description: "CTA hierarchy, distractions, and blockers that slow action.",
  },
] as const;

const DELIVERABLES = [
  "UX score with metric breakdown",
  "Issues ranked by impact",
  "Copy refinements",
  "Exportable PDF report",
] as const;

export function LandingTestReportScope() {
  return (
    <section className={LANDING_SECTION} aria-labelledby="scope-heading">
      <div className={LANDING_CONTAINER}>
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16 xl:gap-24">
          <div>
            <p className={LANDING_EYEBROW}>What Klynt evaluates</p>
            <h2 id="scope-heading" className={LANDING_TITLE}>
              Four lenses on landing-page clarity
            </h2>
            <p className={LANDING_LEAD}>
              Each report scores the page across dimensions that predict whether visitors
              understand, trust, and convert.
            </p>
          </div>

          <ul className="mt-10 divide-y divide-white/[0.06] border-y border-white/[0.06] lg:mt-3 lg:border-y-0 lg:divide-y-0">
            {DIMENSIONS.map((item) => (
              <li
                key={item.title}
                className="py-5 first:pt-0 last:pb-0 lg:border-t lg:border-white/[0.06] lg:py-6 lg:first:border-t-0"
              >
                <p className="text-[16px] font-medium leading-[22px] text-white md:text-[17px]">
                  {item.title}
                </p>
                <p className="mt-1.5 text-[14px] leading-[22px] text-white/45 md:text-[15px] md:leading-[24px]">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-14 border-t border-white/[0.06] pt-10 md:mt-16 md:pt-12">
          <p className={LANDING_EYEBROW}>Included in every report</p>
          <ul className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-2">
            {DELIVERABLES.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-[14px] text-white/55 md:text-[15px]">
                <span className="h-1 w-1 shrink-0 rounded-full bg-white/35" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
