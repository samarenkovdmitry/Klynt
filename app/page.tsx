import Link from "next/link";
import {
  RiArrowRightLine,
  RiSparkling2Line,
  RiBarChartBoxLine,
  RiSearchEyeLine,
  RiMagicLine,
  RiShieldCheckLine,
} from "@remixicon/react";

export default function Home() {
  return (
    <main className="overflow-hidden bg-[#F5F7FA] text-[#061C2F]">

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#53C2EE] pb-[180px]">


        {/* NAVBAR */}
        <header className="relative z-20">
          <div className="mx-auto flex h-[84px] max-w-[1240px] items-center justify-between px-6 lg:px-10">

            {/* LOGO */}
            <div className="flex items-center gap-3">
              <img
                src="/klynt-logo-dark.svg"
                alt="Klynt"
                className="h-[42px] w-auto"
              />
            </div>

            {/* NAV */}
            <div className="flex items-center gap-6 text-[14px] font-medium text-[#061C2F]">
              <a className="opacity-80 transition hover:opacity-100" href="#examples">
                Sample report
              </a>
            </div>
          </div>
        </header>

        {/* HERO CONTENT */}
        <div className="relative z-10 mx-auto flex max-w-[980px] flex-col items-center px-6 pt-16 text-center lg:px-0">

          {/* BADGE */}
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-white/30
              px-4
              py-2
              text-[13px]
              font-medium
              text-[#061C2F]
              backdrop-blur-md
            "
          >
            <RiSparkling2Line size={16} />
            AI-powered UX reviews
          </div>

          {/* H1 */}
          <h1
            className="
              mt-8
              max-w-[860px]
              text-[100px]
              font-semibold
              leading-[0.85]
              tracking-[-0.06em]
              text-[#061C2F]
              text-[#061C2F]
            "
          >
            UX, decoded
          </h1>

          {/* SUB */}
          <p
            className="
              mt-8
              max-w-[700px]
              text-[22px]
              leading-[1.6]
              text-[rgba(6,28,47,0.72)]
            "
          >
            Klynt transforms screenshots and websites into structured UX findings
            with prioritized improvements and measurable impact.
          </p>

          {/* BUTTONS */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">

            <Link
              href="/analyze"
              className="
                inline-flex
                h-[56px]
                items-center
                gap-2
                rounded-full
                bg-[#061C2F]
                px-7
                text-[15px]
                font-semibold
                text-white
                transition-all
                duration-200
                hover:-translate-y-[1px]
                hover:shadow-[0_10px_30px_rgba(6,28,47,0.18)]
              "
            >
              Start free audit
              <RiArrowRightLine size={18} />
            </Link>

          </div>
        </div>
      </section>


      {/* FLOATING REPORT */}
      <section className="relative z-20 -mt-[120px] px-6">
        <div
          className="
            relative
            mx-auto
            max-w-[1120px]
            overflow-hidden
            rounded-[40px]
            border
            border-[rgba(6,28,47,0.06)]
            bg-white
            shadow-[0_40px_120px_rgba(6,28,47,0.12)]
          "
        >

          {/* INNER LIGHT */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#F5FAFF_0%,transparent_60%)]" />

          <div className="relative z-10 p-8 lg:p-10">

            {/* TOP */}
            <div className="flex flex-wrap items-start justify-between gap-6">

              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-[40px] font-semibold tracking-[-0.05em] text-[#061C2F]">
                    Clarity Report
                  </h2>

                  <div className="rounded-full bg-[#EEF2FF] px-3 py-1 text-[12px] font-semibold text-[#5B5BD6]">
                    AI Generated
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-[14px] text-[#6B7280]">
                  <span>https://notion.so</span>
                  <span className="text-neutral-300">•</span>
                  <span>3 screenshots analyzed</span>
                  <span className="text-neutral-300">•</span>
                  <span>Generated May 19, 2026</span>
                </div>
              </div>

              <button
                className="
                  inline-flex
                  h-[44px]
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-[rgba(6,28,47,0.08)]
                  px-5
                  text-[14px]
                  font-medium
                  text-[#061C2F]
                  transition-all
                  hover:bg-[#F8FAFC]
                "
              >
                Export PDF
              </button>
            </div>

            {/* SUMMARY */}
            <div className="mt-8 rounded-[24px] border border-[rgba(6,28,47,0.06)] bg-[#FBFCFD] p-6">

              <h3 className="text-[24px] font-semibold tracking-[-0.03em] text-[#061C2F]">
                Summary
              </h3>

              <div className="mt-5 rounded-[20px] border border-[rgba(6,28,47,0.06)] bg-white px-5 py-4 text-[15px] leading-7 text-[#4B5563]">
                Clear visual structure and modern presentation, but weak CTA specificity
                reduces conversion confidence in the first screen experience.
              </div>

              {/* GRID */}
              <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">

                {/* LEFT */}
                <div className="rounded-[24px] border border-[rgba(6,28,47,0.06)] bg-white p-6">
                  <div className="flex items-center gap-6">

                    {/* SCORE */}
                    <div className="relative flex h-[120px] w-[120px] items-center justify-center">

                      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">

                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          stroke="#E5E7EB"
                          strokeWidth="8"
                          fill="none"
                        />

                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          stroke="#FF7A00"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={327}
                          strokeDashoffset={82}
                        />
                      </svg>

                      <div className="text-center">
                        <p className="text-[13px] font-semibold text-[#061C2F]">
                          UX Score
                        </p>

                        <p className="mt-1 text-[40px] font-semibold leading-none text-[#FF7A00]">
                          75
                        </p>
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div>
                      <p className="max-w-[420px] text-[24px] font-semibold leading-[1.3] tracking-[-0.03em] text-[#061C2F]">
                        Above average UX quality with moderate conversion friction
                      </p>

                      <div className="mt-5 space-y-2 text-[15px] text-[#6B7280]">
                        <div>
                          <span className="font-semibold text-[#061C2F]">Best:</span>{" "}
                          Navigation clarity
                        </div>

                        <div>
                          <span className="font-semibold text-[#061C2F]">Risk:</span>{" "}
                          Trust positioning
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="rounded-[24px] border border-[rgba(6,28,47,0.06)] bg-white p-6">
                  <div className="flex h-full flex-col justify-between">

                    <div>
                      <p className="text-[15px] font-semibold text-[#061C2F]">
                        Conversion Health
                      </p>

                      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#FFF1F1] px-3 py-1 text-[13px] font-semibold text-[#E45454]">
                        <div className="h-2 w-2 rounded-full bg-[#FF5A5A]" />
                        Fair
                      </div>
                    </div>

                    <p className="mt-6 text-[15px] leading-7 text-[#6B7280]">
                      CTA clarity and trust positioning reduce conversion confidence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* FEATURE PILLS */}
      <section className="px-6 pb-8 pt-14">
        <div className="mx-auto flex max-w-[980px] flex-wrap items-center justify-center gap-3">

          {[
            "Prioritized UX issues",
            "Full-page screenshot analysis",
            "Conversion-focused insights",
            "AI copy refinement",
            "Fast visual audit",
            "Designed for product teams",
          ].map((item) => (
            <div
              key={item}
              className="
                rounded-full
                border
                border-[rgba(6,28,47,0.06)]
                bg-white
                px-5
                py-3
                text-[14px]
                font-medium
                text-[#061C2F]
                shadow-[0_2px_10px_rgba(0,0,0,0.02)]
              "
            >
              {item}
            </div>
          ))}
        </div>
      </section>


{/* FEATURES */}
<section className="px-6 py-20">
  <div className="mx-auto max-w-[920px]">

    {/* SECTION 1 — UX Signals */}
    <div className="mx-auto max-w-[760px] text-center">
      <div className="inline-flex items-center rounded-full border border-[#BEE8F7] bg-[#DFF5FF] px-4 py-2 text-[13px] font-semibold text-[#0F7FB3]">
        UX Signals
      </div>

      <h2 className="mt-6 text-[52px] font-semibold leading-[1] tracking-[-0.05em] text-[#061C2F]">
        Key problems hurting clarity and conversion
      </h2>
    </div>

    {/* CARD LIST WITH iOS MASK */}
    <div
      className="
        relative
        max-h-[520px]
        overflow-hidden
        [mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)]
      "
    >
      <div className="mt-14 space-y-5">

        {[1, 2].map((item) => (
          <div
            key={item}
            className="
              rounded-[32px]
              border border-[rgba(6,28,47,0.06)]
              bg-white
              px-8 py-8
            "
          >
            <div className="flex gap-6">

              {/* NUMBER */}
              <div className="text-[34px] font-semibold leading-none tracking-[-0.05em] text-[#D1D5DB]">
                {item}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4">

                  {/* TITLE + PILLS */}
                  <div>
                    <h3 className="text-[26px] font-semibold tracking-[-0.03em] text-[#061C2F]">
                      {item === 1
                        ? "Unclear primary CTA hierarchy"
                        : "Navigation menu lacks visual separation"}
                    </h3>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {/* GRAY PILLS */}
                      <div className="inline-flex items-center rounded-full border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-1 text-[13px] font-medium text-[#6B7280]">
                        Weak hierarchy
                      </div>

                      <div className="inline-flex items-center rounded-full border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-1 text-[13px] font-medium text-[#6B7280]">
                        Weak CTA
                      </div>
                    </div>
                  </div>

                  {/* IMPACT PILLS */}
                  <div className="flex flex-wrap gap-2">
                    <div className="inline-flex items-center rounded-full border border-[#F5C2C2] bg-[#FFF1F1] px-4 py-1.5 text-[14px] font-semibold text-[#E45454]">
                      +16% clarity
                    </div>

                    <div className="inline-flex items-center rounded-full border border-[#F5C2C2] bg-[#FFF1F1] px-4 py-1.5 text-[14px] font-semibold text-[#E45454]">
                      +12% conversion
                    </div>
                  </div>
                </div>

                {/* WHY IT WORKS */}
                <div className="mt-8">
                  <div className="h-px w-full bg-[#E5E7EB]" />

                  <p className="mt-4 text-[15px] font-semibold text-[#061C2F]">
                    Why it works
                  </p>

                  <p className="mt-2 max-w-[720px] text-[16px] leading-8 text-[#6B7280]">
                    Clear action hierarchy helps users instantly identify the main
                    interaction and improves conversion confidence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>

    {/* SECTION 2 — Suggested Improvements */}
    <div className="mt-28 mx-auto max-w-[760px] text-center">
      <div className="inline-flex items-center rounded-full border border-[#BEE8F7] bg-[#DFF5FF] px-4 py-2 text-[13px] font-semibold text-[#0F7FB3]">
        Suggested Improvements
      </div>

      <h2 className="mt-6 text-[52px] font-semibold leading-[1] tracking-[-0.05em] text-[#061C2F]">
        High‑impact fixes to improve the experience
      </h2>
    </div>

    {/* CARD LIST */}
    <div
      className="
        relative
        max-h-[520px]
        overflow-hidden
        mt-14
        [mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)]
      "
    >
      <div className="space-y-5 flex flex-col items-center">

        {/* CARD 1 */}
        <div className="w-full rounded-[32px] border border-[rgba(6,28,47,0.06)] bg-white px-10 py-10">
          <div className="flex gap-6">

            {/* NUMBER */}
            <div className="text-[34px] font-semibold leading-none tracking-[-0.05em] text-[#D1D5DB]">
              1
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start gap-4">

                {/* TITLE + TEXT */}
                <div>
                  <h3 className="text-[28px] font-semibold tracking-[-0.03em] text-[#061C2F]">
                    Hero Section
                  </h3>

                  <p className="mt-4 text-[17px] text-[#6B7280] max-w-[620px] leading-[1.6]">
                    Make the ‘Download’ button more prominent as the primary CTA by increasing size,
                    contrast, or adding a visual indicator.
                  </p>
                </div>

                {/* IMPACT PILL */}
                <div className="inline-flex items-center rounded-full border border-[#C7EBD6] bg-[#E8F7EE] px-4 py-1.5 text-[14px] font-semibold text-[#2E7D4F]">
                  +15% conversion
                </div>
              </div>

              {/* WHY IT WORKS */}
              <div className="mt-6">
                <div className="h-px w-full bg-[#E5E7EB]" />

                <p className="mt-4 text-[15px] font-semibold text-[#061C2F]">Why it works</p>
                <p className="mt-1.5 text-[16px] leading-7 text-[#6B7280] max-w-[620px]">
                  Enhancing CTA visibility directs user focus and improves click‑through rates.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2 */}
        <div className="w-full rounded-[32px] border border-[rgba(6,28,47,0.06)] bg-white px-10 py-10">
          <div className="flex gap-6">

            {/* NUMBER */}
            <div className="text-[34px] font-semibold leading-none tracking-[-0.05em] text-[#D1D5DB]">
              2
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start gap-4">

                {/* TITLE + TEXT */}
                <div>
                  <h3 className="text-[28px] font-semibold tracking-[-0.03em] text-[#061C2F]">
                    Top Menu
                  </h3>

                  <p className="mt-4 text-[17px] text-[#6B7280] max-w-[620px] leading-[1.6]">
                    Introduce visual separators or hover effects for menu items to clarify interactivity.
                  </p>
                </div>

                {/* IMPACT PILL */}
                <div className="inline-flex items-center rounded-full border border-[#C7EBD6] bg-[#E8F7EE] px-4 py-1.5 text-[14px] font-semibold text-[#2E7D4F]">
                  +10% navigation
                </div>
              </div>

              {/* WHY IT WORKS */}
              <div className="mt-6">
                <div className="h-px w-full bg-[#E5E7EB]" />

                <p className="mt-4 text-[15px] font-semibold text-[#061C2F]">Why it works</p>
                <p className="mt-1.5 text-[16px] leading-7 text-[#6B7280] max-w-[620px]">
                  Clearer menu structure improves user orientation and reduces cognitive load.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    {/* SECTION 3 — Copy Refinement */}
    <div className="mt-28 mx-auto max-w-[760px] text-center">
      <div className="inline-flex items-center rounded-full border border-[#BEE8F7] bg-[#DFF5FF] px-4 py-2 text-[13px] font-semibold text-[#0F7FB3]">
        Copy Refinement
      </div>

      <h2 className="mt-6 text-[52px] font-semibold leading-[1] tracking-[-0.05em] text-[#061C2F]">
        Stronger messaging for clearer communication
      </h2>
    </div>

    {/* CARD LIST */}
    <div
      className="
        relative
        max-h-[520px]
        overflow-hidden
        mt-14
        [mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)]
      "
    >
      <div className="space-y-5">

        {/* CARD 1 */}
        <div className="rounded-[32px] border border-[rgba(6,28,47,0.06)] bg-white px-8 py-8">
          <div className="flex gap-6">
            <div className="text-[34px] font-semibold leading-none tracking-[-0.05em] text-[#D1D5DB]">
              1
            </div>

            <div className="flex-1">

              {/* TITLE + IMPACT */}
              <div className="flex justify-between flex-wrap gap-4">
                <h3 className="text-[26px] font-semibold tracking-[-0.03em] text-[#061C2F]">
                  Hero Headline
                </h3>

                <div className="inline-flex items-center rounded-full border border-[#BEE8F7] bg-[#DFF5FF] px-3 py-1 text-[13px] font-semibold text-[#0F7FB3]">
                  +15% clarity
                </div>
              </div>

              {/* BEFORE / IMPROVED */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

                {/* BEFORE */}
                <div className="flex flex-col rounded-[10px] border border-[#E5E7EB] bg-[#F3F4F6] p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="inline-flex items-center rounded-full border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-1 text-[13px] font-medium text-[#6B7280]">
                      Original
                    </div>
                  </div>

                  <p className="text-[16px] text-[#6B7280]">
                    Turn waiting into watching.
                  </p>
                </div>

                {/* IMPROVED */}
                <div className="relative flex flex-col rounded-[10px] border border-[#BEE8F7] bg-[#DFF5FF] p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[13px] font-semibold text-[#6B7280] tracking-wide">
                      IMPROVED
                    </span>

                    <div className="inline-flex items-center rounded-full border border-[#BEE8F7] bg-white/50 px-3 py-1 text-[13px] font-semibold text-[#0F7FB3]">
                      AI Suggestion
                    </div>
                  </div>

                  {/* COPY BUTTON */}
                  <button
                    className="absolute top-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#BEE8F7] bg-white text-[#0F7FB3]"
                    onClick={() => navigator.clipboard.writeText("Beautiful Mac Screensavers That Keep Your Screen Alive.")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16h8M8 12h8m-6-8h6a2 2 0 012 2v12a2 2 0 01-2 2h-6m-4-4H6a2 2 0 01-2-2V6a2 2 0 012-2h2"
                      />
                    </svg>
                  </button>

                  <p className="text-[16px] text-[#061C2F]">
                    Beautiful Mac Screensavers That Keep Your Screen Alive.
                  </p>
                </div>

              </div>

              {/* WHY IT WORKS */}
              <div className="mt-8">
                <div className="h-px w-full bg-[#E5E7EB]" />

                <p className="mt-4 text-[15px] font-semibold text-[#061C2F]">Why it works</p>
                <p className="mt-2 text-[16px] leading-8 text-[#6B7280] max-w-[720px]">
                  Explicitly states product and benefit, improving immediate comprehension.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2 */}
        <div className="rounded-[32px] border border-[rgba(6,28,47,0.06)] bg-white px-8 py-8">
          <div className="flex gap-6">
            <div className="text-[34px] font-semibold leading-none tracking-[-0.05em] text-[#D1D5DB]">
              2
            </div>

            <div className="flex-1">

              <div className="flex justify-between flex-wrap gap-4">
                <h3 className="text-[26px] font-semibold tracking-[-0.03em] text-[#061C2F]">
                  Subheadline
                </h3>

                <div className="inline-flex items-center rounded-full border border-[#BEE8F7] bg-[#DFF5FF] px-3 py-1 text-[13px] font-semibold text-[#0F7FB3]">
                  +10% conversion
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

                {/* BEFORE */}
                <div className="flex flex-col rounded-[10px] border border-[#E5E7EB] bg-[#F3F4F6] p-4">
                  <div className="inline-flex items-center rounded-full border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-1 text-[13px] font-medium text-[#6B7280] mb-2">
                    Original
                  </div>

                  <p className="text-[16px] text-[#6B7280]">
                    Generic subheadline text.
                  </p>
                </div>

                {/* IMPROVED */}
                <div className="relative flex flex-col rounded-[10px] border border-[#BEE8F7] bg-[#DFF5FF] p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[13px] font-semibold text-[#6B7280] tracking-wide">
                      IMPROVED
                    </span>

                    <div className="inline-flex items-center rounded-full border border-[#BEE8F7] bg-white/50 px-3 py-1 text-[13px] font-semibold text-[#0F7FB3]">
                      AI Suggestion
                    </div>
                  </div>

                  {/* COPY BUTTON */}
                  <button
                    className="absolute top-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#BEE8F7] bg-white text-[#0F7FB3]"
                    onClick={() => navigator.clipboard.writeText("Clearer, more benefit‑driven messaging.")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                                            <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16h8M8 12h8m-6-8h6a2 2 0 012 2v12a2 2 0 01-2 2h-6m-4-4H6a2 2 0 01-2-2V6a2 2 0 012-2h2"
                      />
                    </svg>
                  </button>

                  <p className="text-[16px] text-[#061C2F]">
                    Clearer, more benefit‑driven messaging.
                  </p>
                </div>

              </div>

              {/* WHY IT WORKS */}
              <div className="mt-8">
                <div className="h-px w-full bg-[#E5E7EB]" />

                <p className="mt-4 text-[15px] font-semibold text-[#061C2F]">Why it works</p>
                <p className="mt-2 text-[16px] leading-8 text-[#6B7280] max-w-[720px]">
                  Clearer messaging improves comprehension and helps users understand the value faster.
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</section>





      {/* WORKFLOW */}
      <section className="px-6 py-20">
        <div
          className="
            mx-auto
            max-w-[1180px]
            overflow-hidden
            rounded-[40px]
            bg-[#061C2F]
            px-8
            py-10
            text-white
            lg:px-12
            lg:py-14
          "
        >

          <div className="max-w-[720px]">
            <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-[12px] font-semibold text-[#8EDCFF] backdrop-blur-md">
              Workflow
            </div>

            <h2 className="mt-6 text-[54px] font-semibold leading-[1] tracking-[-0.05em]">
              From screenshot to UX insights in minutes
            </h2>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">

            {[
              {
                title: "Submit website or screenshot",
                text: "Paste a URL or upload a full-page screenshot for analysis.",
              },
              {
                title: "AI analyzes UX patterns",
                text: "Klynt detects friction points, weak hierarchy and unclear messaging.",
              },
              {
                title: "Receive structured report",
                text: "Get prioritized UX improvements with measurable impact.",
              },
            ].map((item, index) => (
              <div
                key={item.title}
                className="rounded-[28px] border border-white/10 bg-white/5 p-7 backdrop-blur-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#53C2EE] text-[18px] font-semibold text-[#061C2F]">
                  {index + 1}
                </div>

                <h3 className="mt-7 text-[24px] font-semibold leading-[1.2] tracking-[-0.03em]">
                  {item.title}
                </h3>

                <p className="mt-4 text-[16px] leading-8 text-white/70">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="px-6 py-20">
        <div
          className="
            relative
            mx-auto
            max-w-[1180px]
            overflow-hidden
            rounded-[40px]
            bg-[#53C2EE]
            px-8
            py-20
            text-center
          "
        >

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_65%)]" />

          <div className="relative z-10 mx-auto max-w-[760px]">

            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(6,28,47,0.08)] bg-white/20 px-4 py-2 text-[13px] font-medium text-[#061C2F] backdrop-blur-md">
              <RiSparkling2Line size={16} />
              AI-powered UX reviews
            </div>

            <h2 className="mt-7 text-[58px] font-semibold leading-[0.95] tracking-[-0.05em] text-[#061C2F]">
              Improve clarity before shipping your next release
            </h2>

            <p className="mx-auto mt-7 max-w-[620px] text-[18px] leading-8 text-[rgba(6,28,47,0.75)]">
              Analyze your website with AI and uncover the UX issues reducing
              trust, engagement and conversion.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/analyze"
                className="
                  inline-flex
                  h-[56px]
                  items-center
                  gap-2
                  rounded-full
                  bg-[#061C2F]
                  px-7
                  text-[15px]
                  font-semibold
                  text-white
                  transition-all
                  duration-200
                  hover:-translate-y-[1px]
                  hover:shadow-[0_10px_30px_rgba(6,28,47,0.18)]
                "
              >
                Start free audit
                <RiArrowRightLine size={18} />
              </Link>

              <button
                className="
                  inline-flex
                  h-[56px]
                  items-center
                  rounded-full
                  border
                  border-[rgba(6,28,47,0.10)]
                  bg-white/40
                  px-7
                  text-[15px]
                  font-medium
                  text-[#061C2F]
                  backdrop-blur-md
                "
              >
                View sample report
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* FOOTER */}
      <footer className="border-t border-[rgba(6,28,47,0.06)] px-6 py-8">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-6">

          <div className="flex items-center gap-3">
            <img
              src="/klynt-logo-dark.svg"
              alt="Klynt"
              className="h-8 w-auto"
            />
          </div>

          <div className="flex items-center gap-6 text-[14px] text-[#6B7280]">
            <a className="transition hover:text-[#061C2F]" href="#">
              Privacy
            </a>

            <a className="transition hover:text-[#061C2F]" href="#">
              Terms
            </a>

            <a className="transition hover:text-[#061C2F]" href="#">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}