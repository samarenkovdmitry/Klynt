import { TEST_QUOTES } from "@/lib/landing-test-content";

import { TEST_CONTAINER, TEST_HEADLINE, TEST_SECTION } from "./testStyles";

export function TestQuotesSection() {
  return (
    <section className={`${TEST_SECTION} bg-[#F5F7FA]`}>
      <div className={TEST_CONTAINER}>
        <h2 className={`mx-auto max-w-[520px] text-center ${TEST_HEADLINE}`}>
          Built for teams who ship fast
        </h2>

        <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3 md:gap-5">
          {TEST_QUOTES.map((item) => (
            <figure
              key={item.name}
              className="flex flex-col rounded-[24px] border border-[rgba(6,28,47,0.06)] bg-white p-6 md:p-7"
            >
              <blockquote className="flex-1 text-[18px] font-medium leading-[1.35] tracking-[-0.02em] text-[#061C2F] md:text-[19px]">
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-3 border-t border-[rgba(6,28,47,0.06)] pt-5">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${item.avatarGradient} text-[13px] font-semibold text-white`}
                  aria-hidden
                >
                  {item.initials}
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-[#061C2F]">
                    {item.name}
                  </div>
                  <div className="text-[13px] text-[#6B7280]">{item.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
