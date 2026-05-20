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

        {/* GRID OVERLAY */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
            `,
            backgroundSize: "42px 42px",
          }}
        />

        {/* TOP LIGHT */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_60%)]" />

        {/* NAVBAR */}
        <header className="relative z-20">
          <div className="mx-auto flex h-[84px] max-w-[1240px] items-center justify-between px-6 lg:px-10">

            {/* LOGO */}
            <div className="flex items-center gap-3">
              <img
                src="/public/klynt-logo-dark.svg"
                alt="Klynt"
                className="h-9 w-auto"
              />
            </div>

            {/* NAV */}
            <div className="flex items-center gap-6 text-[14px] font-medium text-[#061C2F]">
              <a className="opacity-80 transition hover:opacity-100" href="#examples">
                Examples
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
              border
              border-[rgba(6,28,47,0.08)]
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
              text-[64px]
              font-semibold
              leading-[0.95]
              tracking-[-0.06em]
              text-[#061C2F]
              sm:text-[72px]
            "
          >
            UX, decoded
          </h1>

          {/* SUB */}
          <p
            className="
              mt-7
              max-w-[700px]
              text-[19px]
              leading-8
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

            <button
              className="
                inline-flex
                h-[56px]
                items-center
                rounded-full
                border
                border-[rgba(6,28,47,0.10)]
                bg-white/50
                px-7
                text-[15px]
                font-medium
                text-[#061C2F]
                backdrop-blur-md
                transition-all
                hover:bg-white/70
              "
            >
              View sample report
            </button>
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
        <div className="mx-auto max-w-[1120px]">

          <div className="mx-auto max-w-[760px] text-center">
            <div className="inline-flex rounded-full bg-[#DFF5FF] px-4 py-2 text-[12px] font-semibold text-[#0F7FB3]">
              UX Signals
            </div>

            <h2 className="mt-6 text-[52px] font-semibold leading-[1] tracking-[-0.05em] text-[#061C2F]">
              Key problems hurting clarity and conversion
            </h2>
          </div>

          <div className="mt-14 space-y-5">

            {[1,2].map((item) => (
              <div
                key={item}
                className="
                  rounded-[32px]
                  border
                  border-[rgba(6,28,47,0.06)]
                  bg-white
                  px-8
                  py-8
                  transition-all
                  duration-200
                  hover:-translate-y-[2px]
                  hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)]
                "
              >
                <div className="flex gap-6">

                  <div className="text-[34px] font-semibold leading-none tracking-[-0.05em] text-[#D1D5DB]">
                    0{item}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-4">

                      <div>
                        <h3 className="text-[26px] font-semibold tracking-[-0.03em] text-[#061C2F]">
                          {item === 1
                            ? "Unclear primary CTA hierarchy"
                            : "Navigation menu lacks visual separation"}
                        </h3>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <div className="rounded-full bg-[#F3F4F6] px-3 py-1 text-[13px] font-medium text-[#6B7280]">
                            Weak hierarchy
                          </div>

                          <div className="rounded-full bg-[#F3F4F6] px-3 py-1 text-[13px] font-medium text-[#6B7280]">
                            Weak CTA
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <div className="rounded-full bg-[#FFF1F1] px-3 py-1 text-[13px] font-semibold text-[#E45454]">
                          +16% clarity
                        </div>

                        <div className="rounded-full bg-[#FFF1F1] px-3 py-1 text-[13px] font-semibold text-[#E45454]">
                          +12% conversion
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <p className="text-[15px] font-semibold text-[#061C2F]">
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
              src="/public/klynt-logo-dark.svg"
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