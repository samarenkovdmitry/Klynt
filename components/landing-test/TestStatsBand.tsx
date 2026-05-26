import { TEST_STATS } from "@/lib/landing-test-content";

import { TEST_CONTAINER } from "./testStyles";

export function TestStatsBand() {
  return (
    <section className="border-y border-[rgba(6,28,47,0.06)] bg-white px-5 py-12 md:px-6 md:py-16">
      <div className={`${TEST_CONTAINER} grid gap-8 md:grid-cols-3 md:gap-6`}>
        {TEST_STATS.map((stat) => (
          <div key={stat.label} className="text-center md:text-left">
            <div className="text-[40px] font-semibold leading-none tracking-[-0.04em] text-[#061C2F] md:text-[52px]">
              {stat.value}
            </div>
            <p className="mt-2 text-[14px] text-[#6B7280] md:text-[15px]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
