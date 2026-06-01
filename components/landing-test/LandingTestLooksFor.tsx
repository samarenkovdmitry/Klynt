import {
  EDITORIAL_CONTAINER,
  EDITORIAL_LABEL,
  EDITORIAL_SECTION,
} from "./landingEditorialStyles";

const LOOKS_FOR = [
  "Trust signals",
  "Decision clarity",
  "Cognitive friction",
  "Conversion blockers",
] as const;

export function LandingTestLooksFor() {
  return (
    <section className={EDITORIAL_SECTION} aria-labelledby="looks-for-heading">
      <div className={EDITORIAL_CONTAINER}>
        <p id="looks-for-heading" className={EDITORIAL_LABEL}>
          What Klynt looks for
        </p>

        <ul className="mt-10 grid grid-cols-1 divide-y divide-white/[0.06] border-y border-white/[0.06] lg:mt-14 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          {LOOKS_FOR.map((item) => (
            <li key={item} className="py-6 lg:px-8 lg:py-8 lg:first:pl-0 lg:last:pr-0">
              <p className="text-[17px] font-medium leading-[24px] text-white md:text-[18px]">
                {item}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
