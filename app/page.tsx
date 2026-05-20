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
RiDownload2Line,
} from "@remixicon/react";



export default function Home() {
return ( <main className="overflow-hidden bg-[#F5F7FA] text-[#061C2F]">

{/* HERO */}
<section className="relative overflow-hidden bg-[#54CDF7] pt-8">

  {/* NAVBAR */}
  <div className="mx-auto flex max-w-[1280px] items-center justify-between px-8">

    {/* LOGO */}
    <img
      src="/klynt-logo-dark.svg"
      alt="Klynt"
      className="h-[42px] w-auto"
    />

    {/* RIGHT */}
    <button
      className="
        text-[14px]
        font-medium
        text-[#061C2F]
        transition-opacity
        hover:opacity-60
      "
    >
      Examples
    </button>
  </div>

  {/* HERO CONTENT */}
  <div className="mx-auto flex max-w-[1280px] flex-col items-center px-8 pb-[140px] pt-[72px] text-center">

    {/* PILL */}
    <div
      className="
        inline-flex
        items-center
        gap-2
        rounded-full
        bg-[rgba(255,255,255,0.16)]
        px-4
        py-2
        text-[13px]
        font-medium
        text-[#061C2F]
        backdrop-blur-sm
      "
    >
      <RiSparkling2Line className="h-4 w-4" />
      AI-powered UX reviews
    </div>

    {/* TITLE */}
    <h1
      className="
        mt-8
        max-w-[920px]
        text-[100px]
        leading-[0.9]
        tracking-[-0.08em]
        font-semibold
        text-[#061C2F]
      "
    >
      UX, decoded
    </h1>

    {/* SUBTITLE */}
    <p
      className="
        mt-8
        max-w-[720px]
        text-[22px]
        leading-[1.6]
        text-[rgba(6,28,47,0.72)]
      "
    >
      Klynt transforms screenshots and websites into structured UX findings
      with prioritized improvements and measurable impact.
    </p>

    {/* CTA */}
    <Link
      href="/analyze"
      className="
        mt-10
        inline-flex
        items-center
        gap-2
        rounded-full
        bg-[#061C2F]
        px-8
        py-4
        text-[16px]
        font-semibold
        text-white
        transition-all
        duration-200
        hover:translate-y-[-1px]
        hover:shadow-[0_12px_30px_rgba(6,28,47,0.18)]
      "
    >
      Start free audit
      <RiArrowRightLine className="h-4 w-4" />
    </Link>
  </div>

  {/* REPORT MOCKUP */}
  <div
    className="
      relative
      z-10
      mx-auto
      -mb-[120px]
      max-w-[1180px]
      px-8
    "
  >
    <div
      className="
        overflow-hidden
        rounded-[34px]
        border
        border-[rgba(6,28,47,0.06)]
        bg-white
        shadow-[0_40px_120px_rgba(6,28,47,0.14)]
      "
    >

      {/* REPORT HEADER */}
      <div className="px-8 pt-8">

        <div className="flex items-start justify-between gap-6">

          <div>

            <div className="flex items-center gap-3">

              <h2
                className="
                  text-[44px]
                  leading-none
                  font-semibold
                  tracking-[-0.05em]
                  text-[#061C2F]
                "
              >
                Clarity Report
              </h2>

              <div
                className="
                  rounded-full
                  bg-[#EEF2FF]
                  px-3
                  py-1
                  text-[12px]
                  font-semibold
                  text-[#5B5BD6]
                "
              >
                AI Generated
              </div>

            </div>

            {/* META */}
            <div
              className="
                mt-4
                flex
                flex-wrap
                items-center
                gap-3
                text-[14px]
                text-[#8A97A5]
              "
            >

              <div className="flex items-center gap-2">
                <img
                  src="https://www.google.com/s2/favicons?domain=notion.so&sz=32"
                  className="h-4 w-4 rounded-sm"
                />

                <span>https://notion.so</span>
              </div>

              <span>•</span>

              <span>3 screenshots analyzed</span>

              <span>•</span>

              <span>Generated May 18, 2026</span>

            </div>

          </div>

          {/* BUTTON */}
          <button
            className="
              flex
              items-center
              gap-2
              rounded-full
              border
              border-[rgba(6,28,47,0.08)]
              px-5
              py-3
              text-[14px]
              font-medium
              text-[#061C2F]
            "
          >
            <RiDownload2Line className="h-4 w-4" />
            Export PDF
          </button>

        </div>

        {/* SUMMARY */}
        <div className="mt-8">

          <h3 className="text-[30px] font-semibold text-[#061C2F]">
            Summary
          </h3>

          <div
            className="
              mt-5
              rounded-[22px]
              border
              border-[rgba(6,28,47,0.06)]
              bg-[#FBFCFD]
              px-6
              py-5
              text-[16px]
              leading-[1.7]
              text-[#425466]
            "
          >
            Clear visual structure and modern presentation, but weak CTA
            specificity reduces conversion confidence in the first screen
            experience.
          </div>

          {/* SCORE ROW */}
          <div className="mt-5 grid grid-cols-[1.4fr_0.8fr] gap-5">

            {/* SCORE CARD */}
            <div
              className="
                rounded-[28px]
                border
                border-[rgba(6,28,47,0.06)]
                bg-white
                px-7
                py-7
              "
            >
              <div className="flex items-center gap-7">

                {/* SCORE */}
                <div className="relative flex h-[132px] w-[132px] items-center justify-center">

                  <svg
                    className="absolute inset-0 h-full w-full -rotate-90"
                    viewBox="0 0 120 120"
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#E9EEF3"
                      strokeWidth="7"
                    />

                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#FF7A00"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={314}
                      strokeDashoffset={78}
                    />
                  </svg>

                  <div className="text-center">
                    <p className="text-[15px] font-semibold text-[#061C2F]">
                      UX Score
                    </p>

                    <p className="mt-1 text-[44px] leading-none font-semibold text-[#FF7A00]">
                      75
                    </p>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="flex-1">

                  <p
                    className="
                      max-w-[620px]
                      text-[24px]
                      leading-[1.35]
                      font-semibold
                      tracking-[-0.03em]
                      text-[#061C2F]
                    "
                  >
                    Above average UX quality with moderate conversion friction
                  </p>

                  <div className="mt-5 space-y-2">

                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-medium text-neutral-500">
                        Best:
                      </span>

                      <span className="text-[15px] text-[#6E7A87]">
                        Navigation clarity
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-medium text-neutral-500">
                        Risk:
                      </span>

                      <span className="text-[15px] text-[#6E7A87]">
                        Trust positioning
                      </span>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* HEALTH */}
            <div
              className="
                rounded-[28px]
                border
                border-[rgba(6,28,47,0.06)]
                bg-white
                px-7
                py-7
              "
            >
              <p className="text-[18px] font-semibold text-[#061C2F]">
                Conversion Health
              </p>

              <div className="mt-5 flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-[#FF6464]" />

                <span className="text-[26px] font-semibold text-[#FF6464]">
                  Fair
                </span>
              </div>

              <p
                className="
                  mt-5
                  text-[15px]
                  leading-[1.7]
                  text-[#8A97A5]
                "
              >
                CTA clarity and trust positioning reduce conversion confidence.
              </p>
            </div>

          </div>
        </div>

        {/* SECTION */}
        {[
          {
            title: "UX Issues",
            tag: "1. UX Issues",
            color: "bg-[#FFEEF0] text-[#FF5A6B]",
          },
          {
            title: "Suggested Improvements",
            tag: "2. Suggested Improvements",
            color: "bg-[#ECFFF4] text-[#23B26D]",
          },
          {
            title: "Copy Refinements",
            tag: "3. Copy Refinements",
            color: "bg-[#EEF8FF] text-[#14A8E8]",
          },
        ].map((section, i) => (
          <div key={i} className="mt-16">

            {/* TAG */}
            <div
              className="
                inline-flex
                items-center
                rounded-full
                bg-[#54CDF7]
                px-3
                py-1
                text-[12px]
                font-semibold
                text-[#061C2F]
              "
            >
              {section.tag}
            </div>

            <h3
              className="
                mt-5
                text-[42px]
                leading-[1.05]
                tracking-[-0.05em]
                font-semibold
                text-[#061C2F]
              "
            >
              {section.title}
            </h3>

            {/* CARDS */}
            <div className="relative mt-8 h-[520px] overflow-hidden">

              {/* CARD 1 */}
              <div
                className="
                  rounded-[28px]
                  border
                  border-[rgba(6,28,47,0.06)]
                  bg-white
                  px-8
                  py-7
                "
              >

                <div className="flex gap-6">

                  <div
                    className="
                      text-[40px]
                      font-semibold
                      text-[#D5DCE3]
                    "
                  >
                    1
                  </div>

                  <div className="flex-1">

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <h4
                          className="
                            text-[28px]
                            leading-[1.2]
                            font-semibold
                            tracking-[-0.03em]
                            text-[#061C2F]
                          "
                        >
                          Unclear primary CTA hierarchy
                        </h4>

                        <div className="mt-4 flex flex-wrap gap-2">

                          <div
                            className="
                              rounded-full
                              border
                              border-[rgba(6,28,47,0.08)]
                              bg-[#F8FAFC]
                              px-3
                              py-1
                              text-[12px]
                              font-medium
                              text-[#7B8794]
                            "
                          >
                            Weak hierarchy
                          </div>

                          <div
                            className="
                              rounded-full
                              border
                              border-[rgba(6,28,47,0.08)]
                              bg-[#F8FAFC]
                              px-3
                              py-1
                              text-[12px]
                              font-medium
                              text-[#7B8794]
                            "
                          >
                            Weak CTA
                          </div>

                        </div>
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">

                        <div
                          className={`
                            rounded-full
                            border
                            px-3
                            py-1
                            text-[12px]
                            font-semibold
                            ${section.color}
                          `}
                        >
                          +15% conversion
                        </div>

                        <div
                          className={`
                            rounded-full
                            border
                            px-3
                            py-1
                            text-[12px]
                            font-semibold
                            ${section.color}
                          `}
                        >
                          +10% clarity
                        </div>

                      </div>
                    </div>

                    <div
                      className="
                        mt-7
                        border-t
                        border-[rgba(6,28,47,0.06)]
                        pt-5
                      "
                    >

                      <p className="text-[13px] font-semibold text-[#061C2F]">
                        Why it works
                      </p>

                      <p
                        className="
                          mt-2
                          max-w-[760px]
                          text-[15px]
                          leading-[1.8]
                          text-[#8A97A5]
                        "
                      >
                        Clear visual hierarchy helps users identify the main
                        action faster, increasing conversion confidence.
                      </p>

                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2 */}
              <div
                className="
                  mt-5
                  rounded-[28px]
                  border
                  border-[rgba(6,28,47,0.06)]
                  bg-white
                  px-8
                  py-7
                "
              >
                <div className="flex gap-6">

                  <div
                    className="
                      text-[40px]
                      font-semibold
                      text-[#D5DCE3]
                    "
                  >
                    2
                  </div>

                  <div>
                    <h4
                      className="
                        text-[28px]
                        leading-[1.2]
                        font-semibold
                        tracking-[-0.03em]
                        text-[#061C2F]
                      "
                    >
                      Navigation menu lacks visual separation
                    </h4>

                    <div className="mt-4 flex gap-2">
                      <div
                        className="
                          rounded-full
                          border
                          border-[rgba(6,28,47,0.08)]
                          bg-[#F8FAFC]
                          px-3
                          py-1
                          text-[12px]
                          font-medium
                          text-[#7B8794]
                        "
                      >
                        Navigation friction
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FADE */}
              <div
                className="
                  pointer-events-none
                  absolute
                  inset-x-0
                  bottom-0
                  h-[220px]
                  bg-gradient-to-b
                  from-transparent
                  to-white
                "
              />

            </div>
          </div>
        ))}

      </div>
    </div>
  </div>

  {/* PILLS */}
  <div className="relative z-20 mx-auto mt-[170px] max-w-[980px] px-8">

    <div className="flex flex-wrap items-center justify-center gap-3">

      {[
        ["Prioritized UX issues", RiBarChartBoxLine],
        ["Full-page screenshot analysis", RiScan2Line],
        ["Conversion-focused insights", RiBarChartBoxLine],
        ["AI copy refinement", RiMagicLine],
        ["Fast visual audit", RiFlashlightLine],
        ["Designed for product teams", RiLayoutGridLine],
      ].map(([label, Icon]: any, i) => (
        <div
          key={i}
          className="
            flex
            items-center
            gap-2
            rounded-full
            border
            border-[rgba(6,28,47,0.08)]
            bg-white
            px-4
            py-2.5
            text-[14px]
            font-medium
            text-[#061C2F]
            shadow-[0_8px_30px_rgba(6,28,47,0.04)]
          "
        >
          <Icon className="h-4 w-4 text-[#14A8E8]" />
          {label}
        </div>
      ))}

    </div>
  </div>

</section>

{/* DARK CTA */}
<section className="px-8 pb-24 pt-32">

  <div
    className="
      relative
      overflow-hidden
      rounded-[40px]
      bg-[#061C2F]
      px-16
      py-16
    "
  >

    {/* GLOW */}
    <div
      className="
        absolute
        left-[120px]
        top-[120px]
        h-[420px]
        w-[420px]
        rounded-full
        bg-[#14A8E8]
        opacity-20
        blur-[140px]
      "
    />

    <div className="relative z-10 grid grid-cols-[0.95fr_1.05fr] items-center gap-16">

      {/* LEFT */}
      <div>

        <div
          className="
            inline-flex
            items-center
            gap-2
            rounded-full
            bg-[rgba(255,255,255,0.08)]
            px-4
            py-2
            text-[13px]
            font-medium
            text-white
          "
        >
          <RiSparkling2Line className="h-4 w-4" />
          AI UX intelligence
        </div>

        <h2
          className="
            mt-8
            max-w-[520px]
            text-[68px]
            leading-[0.92]
            tracking-[-0.06em]
            font-semibold
            text-white
          "
        >
          Improve clarity before shipping your next release
        </h2>

        <p
          className="
            mt-7
            max-w-[520px]
            text-[21px]
            leading-[1.7]
            text-[rgba(255,255,255,0.72)]
          "
        >
          Analyze your website with AI and uncover the UX issues reducing
          trust, engagement, and conversion.
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
            px-8
            py-4
            text-[16px]
            font-semibold
            text-white
            shadow-[0_20px_60px_rgba(20,168,232,0.45)]
          "
        >
          Start free audit
          <RiArrowRightLine className="h-4 w-4" />
        </Link>

      </div>

      {/* RIGHT MOCKUP */}
      <div
        className="
          overflow-hidden
          rounded-[30px]
          border
          border-[rgba(255,255,255,0.08)]
          bg-white
          shadow-[0_40px_100px_rgba(0,0,0,0.35)]
        "
      >

        <div className="px-6 py-6">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <h3
                className="
                  text-[32px]
                  leading-none
                  font-semibold
                  tracking-[-0.05em]
                  text-[#061C2F]
                "
              >
                Clarity Report
              </h3>

              <div
                className="
                  rounded-full
                  bg-[#EEF2FF]
                  px-3
                  py-1
                  text-[11px]
                  font-semibold
                  text-[#5B5BD6]
                "
              >
                AI Generated
              </div>

            </div>

            <div
              className="
                rounded-full
                border
                border-[rgba(6,28,47,0.08)]
                px-4
                py-2
                text-[13px]
                font-medium
                text-[#061C2F]
              "
            >
              Download
            </div>
          </div>

          <div
            className="
              mt-6
              rounded-[20px]
              border
              border-[rgba(6,28,47,0.06)]
              bg-[#FBFCFD]
              px-5
              py-5
            "
          >
            <div className="h-3 w-[70%] rounded-full bg-[#DDE5ED]" />
            <div className="mt-3 h-3 w-[92%] rounded-full bg-[#E9EEF3]" />
            <div className="mt-3 h-3 w-[84%] rounded-full bg-[#E9EEF3]" />
          </div>

          <div className="mt-5 grid grid-cols-[1.4fr_0.8fr] gap-4">

            <div
              className="
                rounded-[22px]
                border
                border-[rgba(6,28,47,0.06)]
                p-5
              "
            >
              <div className="flex items-center gap-5">

                <div
                  className="
                    flex
                    h-[92px]
                    w-[92px]
                    items-center
                    justify-center
                    rounded-full
                    border-[5px]
                    border-[#FF7A00]
                  "
                >
                  <div className="text-center">
                    <div className="text-[12px] font-semibold text-[#061C2F]">
                      UX Score
                    </div>

                    <div className="mt-1 text-[34px] font-semibold text-[#FF7A00]">
                      75
                    </div>
                  </div>
                </div>

                <div>
                  <div
                    className="
                      max-w-[260px]
                      text-[22px]
                      leading-[1.3]
                      font-semibold
                      tracking-[-0.03em]
                      text-[#061C2F]
                    "
                  >
                    Above average UX quality with moderate conversion friction
                  </div>
                </div>
              </div>
            </div>

            <div
              className="
                rounded-[22px]
                border
                border-[rgba(6,28,47,0.06)]
                p-5
              "
            >
              <div className="text-[16px] font-semibold text-[#061C2F]">
                Conversion Health
              </div>

              <div className="mt-4 flex items-center gap-2">

                <div className="h-2.5 w-2.5 rounded-full bg-[#FF6464]" />

                <div className="text-[24px] font-semibold text-[#FF6464]">
                  Fair
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  </div>
</section>

</main>
);
}
