import { HOW_IT_WORKS_STEPS } from "@/lib/landing-content";
import { LandingSectionHeader } from "@/components/landing/LandingSectionHeader";

export function HowItWorksSection() {
  return (
    <div className="mt-12 md:mt-24">
      <LandingSectionHeader
        eyebrow="How it works"
        title="Three steps to a clearer page"
        description="No setup, no signup. Paste a URL and get a structured report in under a minute."
        titleSize="md"
      />

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {HOW_IT_WORKS_STEPS.map((step, index) => (
          <article
            key={step.title}
            className="rounded-[28px] bg-white p-6 md:p-7"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563EB]/10 text-[15px] font-semibold text-[#2563EB]">
              {index + 1}
            </div>

            <h3 className="mt-4 text-[20px] font-semibold leading-[1.2] tracking-[-0.03em] text-[#061C2F] md:text-[22px]">
              {step.title}
            </h3>

            <p className="mt-3 text-[15px] leading-6 text-[#6B7280]">
              {step.description}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
