import Link from "next/link";
import {
  RiArrowRightLine,
  RiSparkling2Line,
  RiSearchEyeLine,
  RiLineChartLine,
  RiEdit2Line,
  RiCheckboxCircleFill,
} from "@remixicon/react";

export default function Home() {
  const features = [
    {
      icon: <RiSearchEyeLine size={22} />,
      title: "Detect UX friction",
      description:
        "Identify confusing layouts, weak hierarchy, trust gaps, and conversion blockers automatically.",
    },
    {
      icon: <RiLineChartLine size={22} />,
      title: "Prioritize by impact",
      description:
        "Understand which UX problems affect engagement, trust, and conversion the most.",
    },
    {
      icon: <RiEdit2Line size={22} />,
      title: "Refine your messaging",
      description:
        "Get AI-generated copy improvements with clearer positioning and stronger CTAs.",
    },
  ];

  const steps = [
    {
      title: "Paste a URL",
      description:
        "Analyze any landing page or upload a full-page screenshot.",
    },
    {
      title: "AI reviews the interface",
      description:
        "Klynt detects usability problems, visual friction, and weak messaging.",
    },
    {
      title: "Get a clarity report",
      description:
        "Receive structured insights with recommendations and prioritized fixes.",
    },
  ];

  const benefits = [
    "Prioritized UX issues",
    "Full-page screenshot analysis",
    "Conversion-focused insights",
    "AI copy refinement",
    "Fast visual audits",
    "Designed for product teams",
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#F5F7FA] text-[#061C2F]">

      {/* BACKGROUND LIGHT */}
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_top,#F7FBFF_0%,transparent_72%)]
        "
      />

      <div className="relative z-10">

        {/* NAVBAR */}
        <header className="mx-auto flex h-[84px] max-w-[1180px] items-center justify-between px-6">

          {/* LOGO */}
          <div className="flex items-center gap-3">

            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                bg-[#14A8E8]
                text-white
                shadow-[0_12px_30px_rgba(20,168,232,0.20)]
              "
            >
              <span className="text-[18px] font-semibold tracking-[-0.05em]">
                K
              </span>
            </div>

            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-semibold tracking-[-0.02em]">
                Klynt
              </span>

              <span className="mt-1 text-[12px] text-[#8E99A2]">
                AI UX clarity audits
              </span>
            </div>

          </div>

          {/* NAV */}
          <nav className="hidden items-center gap-8 md:flex">
            {["Product", "Examples", "Pricing"].map((item) => (
              <button
                key={item}
                className="
                  text-[14px]
                  font-medium
                  text-[#5E6A74]
                  transition
                  hover:text-[#061C2F]
                "
              >
                {item}
              </button>
            ))}
          </nav>

        </header>

        {/* HERO */}
        <section className="px-6 pt-10">

          <div className="mx-auto max-w-[980px] text-center">

            {/* BADGE */}
            <div
              className="
                mx-auto
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-[#DCE7F8]
                bg-[#F4F8FF]
                px-4
                py-1.5
                text-[13px]
                font-semibold
                text-[#2F6FED]
              "
            >
              <RiSparkling2Line size={16} />

              AI-powered UX review
            </div>

            {/* TITLE */}
            <h1
              className="
                mt-8
                text-[72px]
                leading-[0.94]
                tracking-[-0.07em]
                font-semibold
                text-[#061C2F]
              "
            >
              Turn interface friction
              <br />
              into actionable UX fixes
            </h1>

            {/* DESCRIPTION */}
            <p
              className="
                mx-auto
                mt-8
                max-w-[760px]
                text-[21px]
                leading-9
                text-[#5E6A74]
              "
            >
              Klynt analyzes your website screenshots and generates
              prioritized UX issues, copy improvements, and conversion
              recommendations powered by AI.
            </p>

            {/* CTA */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">

              <Link
                href="/analyze"
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-[#14A8E8]
                  px-7
                  py-4
                  text-[15px]
                  font-semibold
                  text-white
                  transition-all
                  duration-200
                  hover:-translate-y-[1px]
                  hover:bg-[#1198D2]
                  hover:shadow-[0_14px_34px_rgba(20,168,232,0.24)]
                "
              >
                Start free audit

                <RiArrowRightLine size={18} />
              </Link>

              <button
                className="
                  rounded-full
                  border
                  border-[rgba(6,28,47,0.08)]
                  bg-white
                  px-7
                  py-4
                  text-[15px]
                  font-medium
                  text-[#061C2F]
                  transition-all
                  duration-200
                  hover:border-[rgba(20,168,232,0.18)]
                  hover:bg-[#F8FBFF]
                "
              >
                View sample report
              </button>

            </div>

            {/* TRUST */}
            <div className="mt-14 flex flex-wrap items-center justify-center gap-3">

              {benefits.map((item) => (
                <div
                  key={item}
                  className="
                    rounded-full
                    border
                    border-[rgba(6,28,47,0.06)]
                    bg-white
                    px-4
                    py-2
                    text-[13px]
                    font-medium
                    text-[#5E6A74]
                  "
                >
                  {item}
                </div>
              ))}

            </div>

          </div>

        </section>

        {/* PREVIEW */}
        <section className="px-6 pt-20">

          <div className="mx-auto max-w-[1180px]">

            <div
              className="
                overflow-hidden
                rounded-[40px]
                border
                border-[rgba(6,28,47,0.06)]
                bg-white
                p-7
                shadow-[0_30px_80px_rgba(0,0,0,0.05)]
              "
            >

              {/* TOP */}
              <div className="flex items-center justify-between">

                <div>
                  <div className="h-5 w-40 rounded-full bg-neutral-200" />
                  <div className="mt-3 h-3 w-56 rounded-full bg-neutral-100" />
                </div>

                <div className="rounded-full bg-[#EEF7FD] px-4 py-2 text-[13px] font-semibold text-[#14A8E8]">
                  AI Generated
                </div>

              </div>

              {/* SUMMARY */}
              <div className="mt-8 grid grid-cols-3 gap-4">

                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="
                      rounded-[28px]
                      border
                      border-neutral-100
                      bg-[#FAFBFC]
                      p-6
                    "
                  >
                    <div className="h-3 w-20 rounded-full bg-neutral-200" />

                    <div className="mt-5 h-14 w-14 rounded-full border-[6px] border-[#14A8E8]" />

                    <div className="mt-5 h-3 w-28 rounded-full bg-neutral-100" />
                  </div>
                ))}

              </div>

              {/* ISSUE */}
              <div className="mt-5 rounded-[32px] border border-neutral-100 p-7">

                <div className="flex items-start justify-between gap-6">

                  <div className="flex-1">

                    <div className="h-6 w-[68%] rounded-full bg-neutral-200" />

                    <div className="mt-4 flex gap-2">
                      <div className="h-8 w-24 rounded-full bg-neutral-100" />
                      <div className="h-8 w-20 rounded-full bg-neutral-100" />
                    </div>

                  </div>

                  <div className="h-10 w-24 rounded-full bg-[#FFF3EA]" />

                </div>

                <div className="mt-6 h-3 w-[95%] rounded-full bg-neutral-100" />
                <div className="mt-3 h-3 w-[84%] rounded-full bg-neutral-100" />

              </div>

            </div>

          </div>

        </section>

        {/* FEATURES */}
        <section className="px-6 pt-28">

          <div className="mx-auto max-w-[1180px]">

            <div className="max-w-[720px]">

              <p className="text-[14px] font-semibold uppercase tracking-[0.12em] text-[#14A8E8]">
                Features
              </p>

              <h2
                className="
                  mt-5
                  text-[48px]
                  leading-[1]
                  tracking-[-0.05em]
                  font-semibold
                "
              >
                Built for modern product teams
              </h2>

            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-3">

              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="
                    rounded-[32px]
                    border
                    border-[rgba(6,28,47,0.06)]
                    bg-white
                    p-7
                    transition-all
                    duration-200
                    hover:-translate-y-[2px]
                    hover:shadow-[0_18px_50px_rgba(0,0,0,0.04)]
                  "
                >

                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-2xl
                      bg-[#F4F8FF]
                      text-[#14A8E8]
                    "
                  >
                    {feature.icon}
                  </div>

                  <h3 className="mt-6 text-[24px] font-semibold tracking-[-0.03em]">
                    {feature.title}
                  </h3>

                  <p className="mt-4 text-[16px] leading-8 text-[#5E6A74]">
                    {feature.description}
                  </p>

                </div>
              ))}

            </div>

          </div>

        </section>

        {/* HOW IT WORKS */}
        <section className="px-6 pt-28">

          <div className="mx-auto max-w-[1180px]">

            <div className="max-w-[720px]">

              <p className="text-[14px] font-semibold uppercase tracking-[0.12em] text-[#14A8E8]">
                Workflow
              </p>

              <h2
                className="
                  mt-5
                  text-[48px]
                  leading-[1]
                  tracking-[-0.05em]
                  font-semibold
                "
              >
                From URL to clarity report
              </h2>

            </div>

            <div className="mt-14 grid gap-5 md:grid-cols-3">

              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="
                    rounded-[32px]
                    border
                    border-[rgba(6,28,47,0.06)]
                    bg-white
                    p-7
                  "
                >

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-full
                      bg-[#14A8E8]
                      text-[16px]
                      font-semibold
                      text-white
                    "
                  >
                    {index + 1}
                  </div>

                  <h3 className="mt-6 text-[24px] font-semibold tracking-[-0.03em]">
                    {step.title}
                  </h3>

                  <p className="mt-4 text-[16px] leading-8 text-[#5E6A74]">
                    {step.description}
                  </p>

                </div>
              ))}

            </div>

          </div>

        </section>

        {/* FINAL CTA */}
        <section className="px-6 pb-28 pt-32">

          <div
            className="
              mx-auto
              max-w-[1180px]
              overflow-hidden
              rounded-[40px]
              bg-[#061C2F]
              px-10
              py-16
              text-center
              text-white
            "
          >

            <div
              className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-[#14A8E8]
              "
            >
              <RiCheckboxCircleFill size={28} />
            </div>

            <h2
              className="
                mx-auto
                mt-8
                max-w-[760px]
                text-[52px]
                leading-[1]
                tracking-[-0.06em]
                font-semibold
              "
            >
              Improve clarity before shipping your next release
            </h2>

            <p
              className="
                mx-auto
                mt-6
                max-w-[700px]
                text-[19px]
                leading-9
                text-[#A9B4BE]
              "
            >
              Analyze your website with AI and uncover the UX issues
              reducing trust, engagement, and conversion.
            </p>

            <Link
              href="/analyze"
              className="
                mt-10
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-[#14A8E8]
                px-7
                py-4
                text-[15px]
                font-semibold
                text-white
                transition-all
                duration-200
                hover:-translate-y-[1px]
                hover:bg-[#1198D2]
              "
            >
              Start free audit

              <RiArrowRightLine size={18} />
            </Link>

          </div>

        </section>

      </div>
    </main>
  );
}