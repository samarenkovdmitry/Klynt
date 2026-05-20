import Link from "next/link";
import {
RiArrowRightLine,
RiSparkling2Line,
RiFocus3Line,
RiScan2Line,
RiBarChartBoxLine,
RiMagicLine,
RiFlashlightLine,
RiLayoutGridLine,
} from "@remixicon/react";

export default function Home() {
return ( <main className="overflow-hidden bg-[#F5F7FA] text-[#061C2F]">

  {/* HERO */}
  <section className="relative overflow-hidden bg-[#14A8E8]">

    {/* BACKGROUND */}
    <div className="absolute inset-0 bg-[#54CDF7]" />

    <div className="relative z-10 mx-auto max-w-[1280px] px-6 pt-7 pb-[140px] lg:px-10">

      {/* NAVBAR */}
      <header className="flex items-center justify-between">

        <Link href="/" className="flex items-center">
          <img
            src="/klynt-logo-dark.svg"
            alt="Klynt"
            className="h-8 w-auto"
          />
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/report/demo"
            className="rounded-full border border-[rgba(6,28,47,0.08)] bg-white/70 px-5 py-2.5 text-[14px] font-medium text-[#061C2F] backdrop-blur transition-all duration-200 hover:bg-white"
          >
            View sample report
          </Link>
        </div>
      </header>

      {/* HERO CONTENT */}
      <div className="mx-auto mt-24 max-w-[980px] text-center">

        {/* PILL */}
        <div className="inline-flex items-center gap-2 rounded-full bg-white/18 px-4 py-2 text-[13px] font-medium text-[#061C2F] backdrop-blur-md">
          <RiSparkling2Line size={15} />
          AI-powered UX reviews
        </div>

        {/* TITLE */}
        <h1
          className="mt-8 text-[72px] font-semibold leading-[0.92] tracking-[-0.07em] text-[#061C2F] md:text-[100px]"
        >
          UX, decoded
        </h1>

        {/* DESCRIPTION */}
        <p className="mx-auto mt-8 max-w-[760px] text-[22px] leading-[1.6] text-[rgba(6,28,47,0.78)]">
          Klynt transforms screenshots and websites into structured UX
          findings with prioritized improvements and measurable impact.
        </p>

        {/* CTA */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/analyze"
            className="group inline-flex items-center gap-2 rounded-full bg-[#061C2F] px-7 py-4 text-[16px] font-semibold text-white transition-all duration-200 hover:translate-y-[-1px] hover:shadow-[0_12px_30px_rgba(6,28,47,0.25)]"
          >
            Start free audit
            <RiArrowRightLine
              size={18}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>

      {/* FLOATING REPORT */}
      <div className="relative mx-auto mt-20 max-w-[1120px]">

        {/* CARD */}
        <div className="overflow-hidden rounded-[40px] border border-[rgba(6,28,47,0.06)] bg-white shadow-[0_40px_120px_rgba(6,28,47,0.16)]">

          {/* TOP */}
          <div className="border-b border-[rgba(6,28,47,0.06)] px-8 py-7">

            <div className="flex items-start justify-between gap-6">

              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-[34px] font-semibold tracking-[-0.04em] text-[#061C2F]">
                    Clarity Report
                  </h2>

                  <div className="rounded-full bg-[#EEF6FF] px-3 py-1 text-[12px] font-semibold text-[#3E7BFF]">
                    AI Generated
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-[14px] text-[#73808C]">

                  <div className="flex items-center gap-2">
                    <img
                      src="https://www.google.com/s2/favicons?domain=notion.so&sz=64"
                      alt="favicon"
                      className="h-4 w-4 rounded-sm"
                    />

                    <span>https://notion.so</span>
                  </div>

                  <span className="text-[#C8D0D7]">•</span>
                  <span>3 screenshots analyzed</span>
                  <span className="text-[#C8D0D7]">•</span>
                  <span>Generated Nov 18, 2026</span>
                </div>
              </div>

              <button
                className="flex items-center gap-2 rounded-full border border-[rgba(6,28,47,0.08)] px-4 py-2 text-[14px] font-medium text-[#061C2F] transition hover:bg-[#F7FAFC]"
              >
                Export PDF
              </button>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="px-8 py-8">

            <h3 className="text-[24px] font-semibold tracking-[-0.03em] text-[#061C2F]">
              Summary
            </h3>

            <div className="mt-5 rounded-[22px] border border-[#E5EBF0] bg-[#FBFCFD] px-5 py-4">
              <p className="text-[16px] leading-7 text-[#44515D]">
                Clear visual structure and modern presentation, but weak CTA
                specificity reduces conversion confidence in the first
                screen experience.
              </p>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">

              {/* SCORE */}
              <div className="rounded-[28px] border border-[#E5EBF0] bg-white p-6">
                <div className="flex items-center gap-6">

                  <div className="relative flex h-[132px] w-[132px] items-center justify-center">

                    <svg className="absolute inset-0 h-full w-full -rotate-90">
                      <circle
                        cx="66"
                        cy="66"
                        r="54"
                        stroke="#E8EDF2"
                        strokeWidth="8"
                        fill="none"
                      />

                      <circle
                        cx="66"
                        cy="66"
                        r="54"
                        stroke="#FF8A28"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={339}
                        strokeDashoffset={85}
                      />
                    </svg>

                    <div className="text-center">
                      <p className="text-[14px] font-semibold text-[#061C2F]">
                        UX Score
                      </p>

                      <p className="mt-1 text-[44px] leading-none font-semibold text-[#FF8A28]">
                        75
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="max-w-[380px] text-[24px] font-semibold leading-[1.35] tracking-[-0.03em] text-[#061C2F]">
                      Above average UX quality with moderate conversion friction
                    </h4>

                    <div className="mt-5 space-y-2 text-[15px] text-[#73808C]">
                      <p>
                        <span className="font-medium text-[#061C2F]">
                          Best:
                        </span>{" "}
                        Navigation clarity
                      </p>

                      <p>
                        <span className="font-medium text-[#061C2F]">
                          Risk:
                        </span>{" "}
                        Trust positioning
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* HEALTH */}
              <div className="rounded-[28px] border border-[#E5EBF0] bg-white p-6">
                <div className="flex h-full flex-col justify-between">

                  <div>
                    <p className="text-[15px] font-semibold text-[#061C2F]">
                      Conversion Health
                    </p>

                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#FFF2F2] px-3 py-1.5 text-[13px] font-semibold text-[#F15A5A]">
                      <div className="h-2 w-2 rounded-full bg-[#F15A5A]" />
                      Fair
                    </div>
                  </div>

                  <p className="mt-6 text-[15px] leading-7 text-[#73808C]">
                    CTA clarity and trust positioning reduce conversion confidence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PILLS */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">

          {[
            {
              icon: RiFocus3Line,
              label: "Prioritized UX issues",
            },
            {
              icon: RiScan2Line,
              label: "Full-page screenshot analysis",
            },
            {
              icon: RiBarChartBoxLine,
              label: "Conversion focused insights",
            },
            {
              icon: RiMagicLine,
              label: "AI copy refinement",
            },
            {
              icon: RiFlashlightLine,
              label: "Fast visual audits",
            },
            {
              icon: RiLayoutGridLine,
              label: "Designed for product teams",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-full border border-[rgba(20,168,232,0.12)] bg-white/90 px-4 py-2 text-[14px] font-medium text-[#167DB0] shadow-[0_4px_14px_rgba(20,168,232,0.06)]"
              >
                <Icon size={16} />
                {item.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </section>


  {/* UX ISSUES */}
  <section className="px-6 py-28 lg:px-10">
    <div className="mx-auto max-w-[1120px]">

      <div className="text-center">
        <div className="inline-flex rounded-full bg-[#DFF5FF] px-3 py-1 text-[12px] font-semibold text-[#1496CF]">
          1. UX Issues
        </div>

        <h2 className="mx-auto mt-6 max-w-[760px] text-[54px] font-semibold leading-[1.02] tracking-[-0.05em] text-[#061C2F]">
          Key problems hurting clarity and conversion
        </h2>
      </div>

      <div className="mt-16 space-y-5">

        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-[32px] border border-[#E5EBF0] bg-white px-8 py-8 shadow-[0_12px_40px_rgba(6,28,47,0.04)]"
          >
            <div className="flex gap-6">

              <div className="w-8 text-[32px] font-semibold tracking-[-0.04em] text-[#C8D0D7]">
                {item}
              </div>

              <div className="flex-1">

                <div className="flex items-start justify-between gap-6">

                  <div>
                    <h3 className="text-[28px] font-semibold tracking-[-0.03em] text-[#061C2F]">
                      Unclear primary CTA hierarchy
                    </h3>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <div className="rounded-full bg-[#F4F7FA] px-3 py-1 text-[12px] font-medium text-[#73808C]">
                        Weak hierarchy
                      </div>

                      <div className="rounded-full bg-[#F4F7FA] px-3 py-1 text-[12px] font-medium text-[#73808C]">
                        Weak CTA
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="rounded-full bg-[#FFF1F1] px-3 py-1 text-[12px] font-semibold text-[#F15A5A]">
                      +15% clarity
                    </div>

                    <div className="rounded-full bg-[#FFF1F1] px-3 py-1 text-[12px] font-semibold text-[#F15A5A]">
                      +18% conversion
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-[15px] font-semibold text-[#061C2F]">
                    Why it matters
                  </p>

                  <p className="mt-2 max-w-[760px] text-[16px] leading-7 text-[#73808C]">
                    Users cannot immediately identify the main action,
                    increasing hesitation and reducing conversion intent.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>


  {/* SUGGESTIONS */}
  <section className="px-6 pb-28 lg:px-10">
    <div className="mx-auto max-w-[1120px]">

      <div className="text-center">
        <div className="inline-flex rounded-full bg-[#DFF5FF] px-3 py-1 text-[12px] font-semibold text-[#1496CF]">
          2. Suggested Improvements
        </div>

        <h2 className="mx-auto mt-6 max-w-[760px] text-[54px] font-semibold leading-[1.02] tracking-[-0.05em] text-[#061C2F]">
          High-impact fixes to improve the experience
        </h2>
      </div>

      <div className="mt-16 space-y-5">

        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-[32px] border border-[#E5EBF0] bg-white px-8 py-8 shadow-[0_12px_40px_rgba(6,28,47,0.04)]"
          >
            <div className="flex gap-6">

              <div className="w-8 text-[32px] font-semibold tracking-[-0.04em] text-[#C8D0D7]">
                {item}
              </div>

              <div className="flex-1">

                <div className="flex items-start justify-between gap-6">

                  <div>
                    <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#8EA0AF]">
                      Hero section
                    </p>

                    <h3 className="mt-2 max-w-[760px] text-[24px] font-medium leading-[1.5] text-[#061C2F]">
                      Make the “Download” button more prominent as the primary CTA by increasing size and contrast.
                    </h3>
                  </div>

                  <div className="rounded-full bg-[#EAFBF2] px-3 py-1 text-[12px] font-semibold text-[#21A366]">
                    +16% conversion
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-[15px] font-semibold text-[#061C2F]">
                    Why it works
                  </p>

                  <p className="mt-2 max-w-[760px] text-[16px] leading-7 text-[#73808C]">
                    Enhancing CTA visibility directs user focus and improves click-through rates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>


  {/* COPY */}
  <section className="px-6 pb-32 lg:px-10">
    <div className="mx-auto max-w-[1120px]">

      <div className="text-center">
        <div className="inline-flex rounded-full bg-[#DFF5FF] px-3 py-1 text-[12px] font-semibold text-[#1496CF]">
          3. Copy Refinement
        </div>

        <h2 className="mx-auto mt-6 max-w-[820px] text-[54px] font-semibold leading-[1.02] tracking-[-0.05em] text-[#061C2F]">
          Stronger messaging for clearer, more persuasive communication
        </h2>
      </div>

      <div className="mt-16 space-y-5">

        {[1, 2].map((item) => (
          <div
            key={item}
            className="rounded-[32px] border border-[#E5EBF0] bg-white px-8 py-8 shadow-[0_12px_40px_rgba(6,28,47,0.04)]"
          >
            <div className="flex gap-6">

              <div className="w-8 text-[32px] font-semibold tracking-[-0.04em] text-[#C8D0D7]">
                {item}
              </div>

              <div className="flex-1">

                <div className="flex items-start justify-between gap-6">

                  <div>
                    <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#8EA0AF]">
                      Hero headline
                    </p>

                    <h3 className="mt-2 text-[24px] font-semibold leading-[1.4] text-[#061C2F]">
                      Improve clarity and conversion intent
                    </h3>
                  </div>

                  <div className="flex gap-2">
                    <div className="rounded-full bg-[#EEF9FF] px-3 py-1 text-[12px] font-semibold text-[#1496CF]">
                      +15% clarity
                    </div>

                    <div className="rounded-full bg-[#EEF9FF] px-3 py-1 text-[12px] font-semibold text-[#1496CF]">
                      +18% conversion
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-2">

                  <div className="rounded-[24px] border border-[#E5EBF0] bg-[#FBFCFD] p-5">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8EA0AF]">
                      Before
                    </p>

                    <p className="mt-4 text-[18px] leading-8 text-[#73808C]">
                      Turn editing into wellbeing.
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-[#D8ECF6] bg-[#F5FCFF] p-5">

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 rounded-full bg-[#E7F7FF] px-3 py-1 text-[12px] font-semibold text-[#1496CF]">
                        Improved
                      </div>

                      <button className="rounded-lg p-2 text-[#1496CF] transition hover:bg-[#EAF7FF]">
                        ⧉
                      </button>
                    </div>

                    <p className="mt-5 text-[20px] font-medium leading-8 text-[#061C2F]">
                      Beautiful Mac Screensavers That Keep Your Screen Alive.
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-[15px] font-semibold text-[#061C2F]">
                    Why it works
                  </p>

                  <p className="mt-2 max-w-[760px] text-[16px] leading-7 text-[#73808C]">
                    Explicitly states product and benefit, improving immediate comprehension.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>


  {/* CTA LIGHT */}
  <section className="px-6 pb-12 lg:px-10">
    <div className="mx-auto max-w-[1120px] overflow-hidden rounded-[40px] bg-[#54CDF7] px-8 py-20 text-center lg:px-16">

      <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-[13px] font-medium text-[#061C2F] backdrop-blur-md">
        <RiSparkling2Line size={15} />
        AI-powered UX reviews
      </div>

      <h2 className="mx-auto mt-8 max-w-[760px] text-[60px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#061C2F]">
        Improve clarity before shipping your next release
      </h2>

      <p className="mx-auto mt-6 max-w-[720px] text-[20px] leading-8 text-[rgba(6,28,47,0.72)]">
        Analyze your website with AI and uncover the UX issues reducing trust, engagement and conversion.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/analyze"
          className="rounded-full bg-[#061C2F] px-7 py-4 text-[16px] font-semibold text-white transition-all duration-200 hover:translate-y-[-1px]"
        >
          Start free audit
        </Link>

        <Link
          href="/report/demo"
          className="rounded-full border border-[rgba(6,28,47,0.08)] bg-white/70 px-7 py-4 text-[16px] font-semibold text-[#061C2F] backdrop-blur transition-all duration-200 hover:bg-white"
        >
          View sample report
        </Link>
      </div>
    </div>
  </section>


  {/* CTA DARK */}
  <section className="px-6 pb-24 lg:px-10">
    <div className="relative mx-auto overflow-hidden rounded-[42px] bg-[#061C2F] px-8 py-20 lg:max-w-[1280px] lg:px-16">

      {/* GLOW */}
      <div className="absolute left-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-[#14A8E8]/30 blur-[120px]" />
      <div className="absolute right-[-120px] bottom-[-120px] h-[360px] w-[360px] rounded-full bg-[#54CDF7]/20 blur-[120px]" />

      <div className="relative z-10 grid items-center gap-16 lg:grid-cols-[0.95fr_1.05fr]">

        {/* LEFT */}
        <div>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-white/80 backdrop-blur-md">
            <RiSparkling2Line size={15} />
            AI UX intelligence
          </div>

          <h2 className="mt-8 max-w-[520px] text-left text-[64px] font-semibold leading-[0.96] tracking-[-0.06em] text-white">
            Ship clearer experiences faster
          </h2>

          <p className="mt-7 max-w-[520px] text-left text-[20px] leading-8 text-[rgba(255,255,255,0.7)]">
            Klynt helps product teams identify friction, improve clarity and optimize conversion before launch.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/analyze"
              className="rounded-full bg-[#14A8E8] px-8 py-4 text-[16px] font-semibold text-[#061C2F] shadow-[0_18px_40px_rgba(20,168,232,0.35)] transition-all duration-200 hover:translate-y-[-2px]"
            >
              Start free audit
            </Link>

            <Link
              href="/report/demo"
              className="rounded-full border border-white/10 bg-white/5 px-7 py-4 text-[16px] font-semibold text-white backdrop-blur transition-all duration-200 hover:bg-white/10"
            >
              View sample report
            </Link>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative">

          <div className="absolute -top-8 right-8 rounded-full bg-[#14A8E8] px-5 py-3 text-[14px] font-semibold text-[#061C2F] shadow-[0_20px_40px_rgba(20,168,232,0.35)]">
            +24% clarity
          </div>

          <div className="rotate-[-3deg] rounded-[34px] border border-white/10 bg-white/5 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">

            <div className="rounded-[28px] bg-white p-6">

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[14px] font-semibold text-[#8EA0AF]">
                    UX Score
                  </p>

                  <p className="mt-1 text-[42px] font-semibold leading-none text-[#FF8A28]">
                    82
                  </p>
                </div>

                <div className="rounded-full bg-[#EAFBF2] px-3 py-1 text-[12px] font-semibold text-[#21A366]">
                  Above average
                </div>
              </div>

              <div className="mt-6 rounded-[20px] border border-[#E5EBF0] bg-[#FBFCFD] p-4">
                <p className="text-[14px] font-semibold text-[#061C2F]">
                  Top recommendation
                </p>

                <p className="mt-2 text-[15px] leading-7 text-[#73808C]">
                  Improve CTA specificity in the hero section to reduce hesitation and increase conversion intent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>


  {/* FOOTER */}
  <footer className="border-t border-[rgba(6,28,47,0.06)] bg-white px-6 py-8 lg:px-10">
    <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-6 lg:flex-row">

      <img
        src="/klynt-logo-dark.svg"
        alt="Klynt"
        className="h-7 w-auto"
      />

      <div className="flex items-center gap-6 text-[14px] text-[#73808C]">
        <Link href="#">Privacy</Link>
        <Link href="#">Terms</Link>
        <Link href="#">Contact</Link>
      </div>
    </div>
  </footer>
</main>


);
}
