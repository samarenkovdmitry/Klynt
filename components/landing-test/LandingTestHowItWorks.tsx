import { RiFileList3Line, RiLink, RiShareForwardLine } from "@remixicon/react";

import {
  LANDING_CONTAINER,
  LANDING_DIVIDER,
  LANDING_SECTION,
} from "./landingPageStyles";

const STEPS = [
  {
    icon: RiLink,
    title: "Paste a URL",
    description:
      "Or upload a screenshot. Add context: brand stage, traffic source, audience.",
  },
  {
    icon: RiFileList3Line,
    title: "Get your improvement kit",
    description:
      "Copy variants, fix checklist, score potential, and visual suggestions — in about a minute.",
  },
  {
    icon: RiShareForwardLine,
    title: "Share with your team",
    description:
      "Export as copy deck, designer brief, dev tasks, or Notion-ready summary.",
  },
] as const;

export function LandingHowItWorksDivider() {
  return <div className={LANDING_DIVIDER} aria-hidden />;
}

export function LandingTestHowItWorks() {
  return (
    <section className={`${LANDING_SECTION} !py-20 md:!py-24`} aria-labelledby="how-heading">
      <div className={`${LANDING_CONTAINER} max-w-[860px]`}>
        <h2
          id="how-heading"
          className="text-center font-sans text-[clamp(22px,3vw,32px)] font-semibold tracking-[-0.03em] text-[#F2F2EF]"
        >
          How it works
        </h2>

        <ol className="relative mt-12 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-0">
          <div
            className="pointer-events-none absolute left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] top-6 hidden h-px bg-gradient-to-r from-white/[0.08] via-white/[0.14] to-white/[0.08] md:block"
            aria-hidden
          />

          {STEPS.map(({ icon: Icon, title, description }) => (
            <li key={title} className="relative z-[1] px-0 text-center md:px-6">
              <div className="relative z-[1] mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.14] bg-[#1C1C19] text-[18px] text-[#9A9A93]">
                <Icon aria-hidden />
              </div>
              <h3 className="mt-4 font-sans text-[15px] font-semibold tracking-[-0.02em] text-[#F2F2EF]">
                {title}
              </h3>
              <p className="mt-2 text-[13px] leading-[1.6] text-[#9A9A93]">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
