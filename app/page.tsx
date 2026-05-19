import Link from "next/link";
import {
  RiArrowRightUpLine,
  RiSparkling2Line,
  RiEyeLine,
  RiCheckboxCircleLine,
  RiLineChartLine,
  RiLayoutGridLine,
} from "@remixicon/react";

export default function Home() {
  return (
    <main className="bg-[#F5F7FA] text-[#061C2F] overflow-hidden">

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#061C2F]">

        {/* GRADIENTS */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,168,232,0.28),transparent_38%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(66,117,255,0.18),transparent_30%)]" />

        {/* GRID */}
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.4)_1px,transparent_1px)] bg-[size:72px_72px]" />

        <div className="relative mx-auto max-w-[1280px] px-8 pt-8 pb-28">

          {/* NAVBAR */}
          <header className="flex items-center justify-between">

            {/* LOGO */}
            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <div className="h-5 w-5 rounded-full bg-[#14A8E8]" />
              </div>

              <div>
                <div className="text-[18px] font-semibold tracking-[-0.03em] text-white">
                  Klynt
                </div>

                <div className="text-[12px] text-white/50">
                  AI UX clarity platform
                </div>
              </div>
            </div>

            {/* NAV */}
            <div className="hidden md:flex items-center gap-8 text-[14px] text-white/70">
              <a href="#features" className="hover:text-white transition">
                Features
              </a>

              <a href="#workflow" className="hover:text-white transition">
                Workflow
              </a>

              <a href="#pricing" className="hover:text-white transition">
                Pricing
              </a>
            </div>

          </header>

          {/* HERO CONTENT */}
          <div className="relative mt-24 grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">

            {/* LEFT */}
            <div>

              {/* BADGE */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">

                <RiSparkling2Line
                  size={16}
                  className="text-[#14A8E8]"
                />

                <span className="text-[13px] font-medium text-white/80">
                  AI-powered UX clarity analysis
                </span>
              </div>

              {/* TITLE */}
              <h1
                className="
                  mt-8
                  max-w-[760px]
                  text-[72px]
                  leading-[0.95]
                  tracking-[-0.06em]
                  font-semibold
                  text-white
                "
              >
                Find conversion
                friction before
                your users do.
              </h1>

              {/* SUBTITLE */}
              <p
                className="
                  mt-8
                  max-w-[640px]
                  text-[22px]
                  leading-[1.6]
                  text-white/70
                "
              >
                Klynt analyzes websites using AI and transforms
                messy interfaces into clear UX problems,
                conversion risks and actionable improvements.
              </p>

              {/* CTA */}
              <div className="mt-10 flex flex-wrap items-center gap-4">

                <Link
                  href="/analyze"
                  className="
                    group
                    inline-flex
                    h-[58px]
                    items-center
                    gap-3
                    rounded-2xl
                    bg-[#14A8E8]
                    px-7
                    text-[16px]
                    font-semibold
                    text-white
                    transition-all
                    duration-300
                    hover:-translate-y-[1px]
                    hover:shadow-[0_12px_40px_rgba(20,168,232,0.45)]
                  "
                >
                  Start free audit

                  <RiArrowRightUpLine
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
                  />
                </Link>

                <div className="text-[14px] text-white/50">
                  No signup required
                </div>
              </div>

              {/* METRICS */}
              <div className="mt-16 flex flex-wrap gap-10">

                <div>
                  <div className="text-[34px] font-semibold text-white">
                    +37%
                  </div>

                  <div className="mt-1 text-[14px] text-white/50">
                    Average clarity uplift
                  </div>
                </div>

                <div>
                  <div className="text-[34px] font-semibold text-white">
                    12s
                  </div>

                  <div className="mt-1 text-[14px] text-white/50">
                    To detect key UX issues
                  </div>
                </div>

                <div>
                  <div className="text-[34px] font-semibold text-white">
                    AI
                  </div>

                  <div className="mt-1 text-[14px] text-white/50">
                    Interface reasoning engine
                  </div>
                </div>

              </div>

            </div>

            {/* RIGHT */}
            <div className="relative">

              {/* GLOW */}
              <div className="absolute inset-0 blur-[90px] bg-[#14A8E8]/20" />

              {/* MAIN CARD */}
              <div
                className="
                  relative
                  rounded-[36px]
                  border
                  border-white/10
                  bg-white/[0.06]
                  p-6
                  backdrop-blur-2xl
                "
              >

                {/* TOP */}
                <div className="flex items-center justify-between">

                  <div>
                    <div className="text-[13px] text-white/50">
                      UX Clarity Report
                    </div>

                    <div className="mt-2 text-[28px] font-semibold text-white">
                      stripe.com
                    </div>
                  </div>

                  <div
                    className="
                      flex
                      h-[88px]
                      w-[88px]
                      items-center
                      justify-center
                      rounded-full
                      border-[6px]
                      border-[#14A8E8]
                      text-[28px]
                      font-semibold
                      text-white
                    "
                  >
                    82
                  </div>

                </div>

                {/* CARDS */}
                <div className="mt-8 space-y-4">

                  {[
                    "Weak hierarchy in hero section",
                    "CTA lacks visual dominance",
                    "Trust signals appear too late",
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="
                        rounded-2xl
                        border
                        border-white/10
                        bg-white/[0.04]
                        p-4
                      "
                    >
                      <div className="flex items-start gap-3">

                        <div className="mt-1">
                          <RiCheckboxCircleLine
                            size={18}
                            className="text-[#14A8E8]"
                          />
                        </div>

                        <div>
                          <div className="text-[15px] font-medium text-white">
                            {item}
                          </div>

                          <div className="mt-1 text-[13px] leading-6 text-white/50">
                            AI identified conversion friction
                            affecting clarity and user confidence.
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}

                </div>

              </div>

              {/* FLOATING */}
              <div
                className="
                  absolute
                  -left-10
                  top-10
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.08]
                  px-4
                  py-3
                  backdrop-blur-xl
                "
              >
                <div className="flex items-center gap-3">

                  <RiLineChartLine
                    size={18}
                    className="text-[#14A8E8]"
                  />

                  <div>
                    <div className="text-[12px] text-white/50">
                      Conversion impact
                    </div>

                    <div className="text-[16px] font-semibold text-white">
                      +18%
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="relative py-28"
      >
        <div className="mx-auto max-w-[1200px] px-8">

          <div className="max-w-[760px]">

            <div className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#14A8E8]">
              Features
            </div>

            <h2 className="mt-5 text-[56px] leading-[1] tracking-[-0.05em] font-semibold">
              Built for modern
              product teams
            </h2>

          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">

            {[
              {
                icon: RiEyeLine,
                title: "Visual hierarchy analysis",
                text: "Detects clutter, weak emphasis and scanning problems.",
              },
              {
                icon: RiLayoutGridLine,
                title: "Conversion-focused audits",
                text: "Finds CTA friction and trust gaps affecting actions.",
              },
              {
                icon: RiSparkling2Line,
                title: "AI copy refinement",
                text: "Improves messaging clarity and persuasion instantly.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-[32px]
                  border
                  border-[rgba(6,28,47,0.06)]
                  bg-white
                  p-8
                  transition-all
                  duration-300
                  hover:-translate-y-[3px]
                  hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)]
                "
              >

                <div className="absolute right-0 top-0 h-[140px] w-[140px] rounded-full bg-[#14A8E8]/[0.06] blur-3xl" />

                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#EEF8FD]
                  "
                >
                  <item.icon
                    size={24}
                    className="text-[#14A8E8]"
                  />
                </div>

                <h3 className="mt-8 text-[24px] leading-tight font-semibold">
                  {item.title}
                </h3>

                <p className="mt-4 text-[16px] leading-8 text-[#5F7283]">
                  {item.text}
                </p>

              </div>
            ))}

          </div>

        </div>
      </section>

      {/* DARK STRIP */}
      <section
        id="workflow"
        className="relative overflow-hidden bg-[#061C2F] py-24"
      >

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(20,168,232,0.22),transparent_40%)]" />

        <div className="relative mx-auto max-w-[1200px] px-8">

          <div className="max-w-[760px]">

            <div className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#14A8E8]">
              Workflow
            </div>

            <h2 className="mt-5 text-[56px] leading-[1] tracking-[-0.05em] font-semibold text-white">
              From screenshot
              to UX clarity
            </h2>

          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">

            {[
              {
                step: "01",
                title: "Paste a URL",
                text: "Klynt captures key sections of your interface automatically.",
              },
              {
                step: "02",
                title: "AI analyzes friction",
                text: "Visual hierarchy, clarity, trust and conversion are evaluated.",
              },
              {
                step: "03",
                title: "Receive a report",
                text: "Actionable UX insights and copy improvements in seconds.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="
                  rounded-[30px]
                  border
                  border-white/10
                  bg-white/[0.04]
                  p-8
                  backdrop-blur-xl
                "
              >

                <div className="text-[14px] font-semibold text-[#14A8E8]">
                  {item.step}
                </div>

                <h3 className="mt-6 text-[28px] leading-tight font-semibold text-white">
                  {item.title}
                </h3>

                <p className="mt-4 text-[16px] leading-8 text-white/60">
                  {item.text}
                </p>

              </div>
            ))}

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[rgba(6,28,47,0.06)] bg-white py-10">

        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 px-8 md:flex-row">

          <div>
            <div className="text-[18px] font-semibold tracking-[-0.03em]">
              Klynt
            </div>

            <div className="mt-2 text-[14px] text-[#6B7A88]">
              AI UX clarity platform
            </div>
          </div>

          <div className="flex items-center gap-8 text-[14px] text-[#6B7A88]">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>

        </div>

      </footer>

    </main>
  );
}