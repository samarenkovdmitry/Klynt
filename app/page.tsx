import Link from "next/link";
import {
  RiArrowRightLine,
  RiSparkling2Line,
  RiSearchEyeLine,
  RiLineChartLine,
  RiEdit2Line,
  RiCheckboxCircleFill,
  RiScanLine,
  RiBubbleChartLine,
  RiFileChartLine
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
<section className="px-6 py-24">
  <div className="mx-auto max-w-[1180px]">

    {/* HEADER */}
    <div className="max-w-[760px]">
      <div
        className="
          inline-flex
          items-center
          rounded-full
          border
          border-[#DCE7F8]
          bg-[#F4F8FF]
          px-3
          py-1
          text-[12px]
          font-semibold
          text-[#2F6FED]
        "
      >
        Platform
      </div>

      <h2
        className="
          mt-5
          text-[42px]
          leading-[1.05]
          tracking-[-0.04em]
          font-semibold
          text-[#061C2F]
        "
      >
        Designed for fast, actionable UX audits
      </h2>

      <p
        className="
          mt-5
          max-w-[680px]
          text-[18px]
          leading-8
          text-[#6B7280]
        "
      >
        Klynt transforms screenshots and websites into structured
        UX findings with prioritized improvements and measurable impact.
      </p>
    </div>

    {/* GRID */}
    <div className="mt-14 grid gap-5 md:grid-cols-2">

      {/* BIG CARD */}
      <div
        className="
          relative
          overflow-hidden
          rounded-[36px]
          border
          border-[rgba(6,28,47,0.06)]
          bg-white
          p-8
        "
      >

        {/* LIGHT */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-[radial-gradient(circle_at_top_left,#EAF4FF_0%,transparent_60%)]
          "
        />

        <div className="relative z-10">

          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-[#F4F8FF]
            "
          >
            <RiScanLine size={26} className="text-[#14A8E8]" />
          </div>

          <h3
            className="
              mt-8
              text-[28px]
              leading-[1.1]
              tracking-[-0.03em]
              font-semibold
              text-[#061C2F]
            "
          >
            Full-page UX analysis
          </h3>

          <p
            className="
              mt-4
              max-w-[420px]
              text-[16px]
              leading-7
              text-[#6B7280]
            "
          >
            Automatically captures long pages, detects friction,
            messaging gaps, weak hierarchy, trust issues,
            and conversion blockers.
          </p>

          {/* MOCK */}
          <div
            className="
              mt-10
              rounded-[24px]
              border
              border-[rgba(6,28,47,0.06)]
              bg-[#F7FAFC]
              p-5
            "
          >
            <div className="space-y-3">

              <div className="h-3 w-[70%] rounded-full bg-[#DCE7F8]" />
              <div className="h-3 w-[90%] rounded-full bg-[#E7EDF5]" />
              <div className="h-3 w-[55%] rounded-full bg-[#DCE7F8]" />

              <div className="pt-4">
                <div className="rounded-2xl bg-white p-4 shadow-sm">

                  <div className="flex items-center justify-between">

                    <div>
                      <div className="h-3 w-24 rounded-full bg-[#DCE7F8]" />
                      <div className="mt-2 h-2 w-40 rounded-full bg-[#EEF2F7]" />
                    </div>

                    <div
                      className="
                        rounded-full
                        bg-[#FFF1E6]
                        px-3
                        py-1
                        text-[12px]
                        font-semibold
                        text-[#FF7A00]
                      "
                    >
                      -18% Clarity
                    </div>

                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="grid gap-5">

        {/* CARD */}
        <div
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
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-[#F4F8FF]
            "
          >
            <RiBubbleChartLine size={22} className="text-[#14A8E8]" />
          </div>

          <h3
            className="
              mt-6
              text-[24px]
              leading-[1.15]
              font-semibold
              tracking-[-0.03em]
              text-[#061C2F]
            "
          >
            Prioritized improvements
          </h3>

          <p
            className="
              mt-3
              text-[15px]
              leading-7
              text-[#6B7280]
            "
          >
            Suggestions ranked by expected impact on conversion,
            trust, clarity, and engagement.
          </p>
        </div>

        {/* CARD */}
        <div
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
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-[#F4F8FF]
            "
          >
            <RiFileChartLine size={22} className="text-[#14A8E8]" />
          </div>

          <h3
            className="
              mt-6
              text-[24px]
              leading-[1.15]
              font-semibold
              tracking-[-0.03em]
              text-[#061C2F]
            "
          >
            Shareable UX reports
          </h3>

          <p
            className="
              mt-3
              text-[15px]
              leading-7
              text-[#6B7280]
            "
          >
            Clean reports designed for founders,
            marketers, designers, and product teams.
          </p>
        </div>

      </div>

    </div>
  </div>
</section>

{/* WORKFLOW */}
<section className="px-6 py-24">
  <div className="mx-auto max-w-[1180px]">

    {/* HEADER */}
    <div className="max-w-[760px]">

      <div
        className="
          inline-flex
          items-center
          rounded-full
          border
          border-[#DCE7F8]
          bg-[#F4F8FF]
          px-3
          py-1
          text-[12px]
          font-semibold
          text-[#2F6FED]
        "
      >
        Workflow
      </div>

      <h2
        className="
          mt-5
          text-[42px]
          leading-[1.05]
          tracking-[-0.04em]
          font-semibold
          text-[#061C2F]
        "
      >
        From screenshot to UX insights in minutes
      </h2>

      <p
        className="
          mt-5
          max-w-[680px]
          text-[18px]
          leading-8
          text-[#6B7280]
        "
      >
        Klynt turns visual interfaces into structured UX analysis
        with prioritized improvements and measurable impact.
      </p>

    </div>

    {/* TIMELINE */}
    <div className="mt-16 max-w-[900px]">

      {[
        {
          title: "Submit website or screenshot",
          text: "Paste a URL or upload a full-page screenshot for analysis.",
        },
        {
          title: "AI analyzes UX patterns",
          text: "Klynt detects friction points, weak hierarchy, unclear messaging and trust issues.",
        },
        {
          title: "Receive structured report",
          text: "Get prioritized UX improvements with clear explanations and estimated impact.",
        },
      ].map((item, i) => (
        <div
          key={i}
          className="relative flex gap-6 pb-12 last:pb-0"
        >

          {/* LINE */}
          {i !== 2 && (
            <div
              className="
                absolute
                left-[19px]
                top-10
                h-full
                w-px
                bg-[#DCE7F8]
              "
            />
          )}

          {/* NUMBER */}
          <div
            className="
              relative
              z-10
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#14A8E8]
              text-[15px]
              font-semibold
              text-white
            "
          >
            {i + 1}
          </div>

          {/* CONTENT */}
          <div className="pt-1">

            <h3
              className="
                text-[24px]
                font-semibold
                tracking-[-0.03em]
                text-[#061C2F]
              "
            >
              {item.title}
            </h3>

            <p
              className="
                mt-3
                max-w-[620px]
                text-[16px]
                leading-7
                text-[#6B7280]
              "
            >
              {item.text}
            </p>

          </div>
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