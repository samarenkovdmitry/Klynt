import { RiArrowRightSLine } from "@remixicon/react";

import { HOW_IT_WORKS_STEPS } from "@/lib/landing-content";

export function TestHowItWorksSection() {
  return (
    <section className="bg-white px-5 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1040px]">
        <div className="mx-auto max-w-[640px] text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
            How it works
          </p>
          <h2 className="mt-4 text-[34px] font-semibold leading-[0.98] tracking-[-0.04em] text-[#061C2F] md:text-[44px]">
            Three steps to a clearer page
          </h2>
          <p className="mt-5 text-[17px] leading-7 text-[#6B7280]">
            No setup, no signup. Paste a URL and get a structured report in
            under a minute.
          </p>
        </div>

        <ol className="mt-12 md:mt-16">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <li
              key={step.title}
              className="relative flex flex-col gap-6 md:flex-row md:items-start md:gap-8"
            >
              <div className="flex shrink-0 items-center gap-4 md:w-[220px] md:flex-col md:items-start md:gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2563EB] text-[15px] font-semibold text-white">
                  {index + 1}
                </div>
                <h3 className="text-[20px] font-semibold leading-[1.2] tracking-[-0.03em] text-[#061C2F] md:text-[22px]">
                  {step.title}
                </h3>
              </div>

              <div className="flex-1 pb-10 md:pb-12">
                <p className="max-w-[560px] text-[15px] leading-6 text-[#6B7280] md:text-[16px]">
                  {step.description}
                </p>
              </div>

              {index < HOW_IT_WORKS_STEPS.length - 1 ? (
                <RiArrowRightSLine
                  size={22}
                  className="absolute right-0 top-1 hidden rotate-90 text-[#CBD5E1] md:top-3 md:block md:rotate-0"
                  aria-hidden
                />
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
