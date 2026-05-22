"use client";
import Link from "next/link";
import { useState } from "react";
import {
  RiArrowRightLine,
  RiDownload2Line,
  RiSparkling2Line,
  RiBarChartBoxLine,
  RiSearchEyeLine,
  RiMagicLine,
  RiShieldCheckLine,
  RiFileCopyLine,
  RiCheckLine,
} from "@remixicon/react";

export default function Home() {

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  async function handleCopy(text: string, index: number) {
    await navigator.clipboard.writeText(text);

    setCopiedIndex(index);

    setTimeout(() => {
      setCopiedIndex(null);
    }, 1500);
  }

  return (
    <main className="overflow-hidden bg-[#F5F7FA] text-[#061C2F]">

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#53C2EE] pb-[120px] md:pb-[180px]">


        {/* NAVBAR */}
        <header className="relative z-20">
          <div className="mx-auto flex h-[72px] md:h-[84px] max-w-[1240px] items-center justify-between px-5 md:px-6 lg:px-10">

            {/* LOGO */}
            <div className="flex items-center gap-3">
              <img
                src="/klynt-logo-dark.svg"
                alt="Klynt"
                className="h-[36px] md:h-[42px] w-auto"
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
        <div className="relative z-10 mx-auto flex max-w-[980px] flex-col items-center px-5 pt-10 md:pt-16 text-center lg:px-0">

          {/* H1 */}
          <h1
            className="
              mt-6
              max-w-[860px]
              text-[54px]
              md:text-[85px]
              font-semibold
              leading-[1.05]
              md:leading-[0.85]
              tracking-[-0.07em]
              md:tracking-[-0.06em]
              text-[#061C2F]
              "
          >
            Nothing but clarity
          </h1>

          {/* SUB */}
          <p
            className="
              mt-6
              max-w-[640px]
              text-[18px]
              md:text-[22px]
              leading-[1.5]
              md:leading-[1.6]
              text-[rgba(6,28,47,0.72)]
              "
          >
            AI that finds weak points in your UX and copy, explains them, and offers clear improvements.
          </p>

          {/* BUTTONS */}
          <div className="mt-8 md:mt-10 flex flex-wrap items-center justify-center gap-3 md:gap-4">

            <Link
              href="/analyze"
              className="
                inline-flex
                h-[52px] md:h-[56px]
                items-center
                gap-2
                rounded-full
                bg-[#061C2F]
                px-7
                text-[18px]
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
<section className="relative z-20 -mt-[70px] md:-mt-[120px] px-4 md:px-6">
  <div
    className="
      relative
      mx-auto
      max-w-[960px]
      overflow-hidden
      rounded-[28px] md:rounded-[40px]
      border
      border-[rgba(6,28,47,0.06)]
      bg-white
      shadow-[0_30px_80px_rgba(6,28,47,0.12)]
    "
  >

    {/* LIGHT */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#F5FAFF_0%,transparent_60%)]" />

    <div className="relative z-10 p-4 md:p-8 lg:p-10">

      {/* TOP */}
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

        {/* LEFT */}
        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-3 md:gap-3 justify-between">

            <h2
              className="
                text-[28px]
                leading-none
                tracking-[-0.05em]
                text-[#061C2F]
                md:text-[40px]
                font-semibold
              "
            >
              Clarity Report
            </h2>

            <div
              className="
                inline-flex
                h-[28px]
                items-center
                rounded-full
                bg-[#EEF2FF]
                px-3
                text-[11px]
                font-semibold
                text-[#5B5BD6]
                md:h-[32px]
                md:px-4
                md:text-[12px]
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
              gap-x-3
              gap-y-2
              text-[12px]
              text-[#6B7280]
              md:text-[14px]
            "
          >

            <div className="flex items-center gap-2">

              <img
                src="https://www.google.com/s2/favicons?domain=notion.so&sz=64"
                alt=""
                className="h-4 w-4 rounded-sm"
              />

              <span>https://notion.so</span>
            </div>

            <span className="hidden md:block text-neutral-300">•</span>

            <span>3 screens</span>

            <span className="hidden md:block text-neutral-300">•</span>

            <span>May 19</span>
          </div>
        </div>

        {/* DOWNLOAD */}
        <button
          className="
            inline-flex
            h-[48px]
            w-full
            shrink-0
            items-center
            justify-center
            gap-2
            rounded-full
            border
            border-[rgba(6,28,47,0.08)]
            bg-white
            px-5
            text-[14px]
            font-medium
            text-[#061C2F]
            transition-all
            hover:bg-[#F8FAFC]
            md:w-auto
          "
        >
          <RiDownload2Line size={18} />
          <span>Download PDF</span>
        </button>
      </div>

      {/* SUMMARY */}
      <div
        className="
          mt-3
          rounded-[24px]
          md:border
          md:border-[rgba(6,28,47,0.06)]
          bg-[#FFFFFF]
          md:p-4
          md:mt-8
          md:p-6
        "
      >

        <h3
          className="
            text-[20px]
            font-semibold
            tracking-[-0.03em]
            text-[#061C2F]
            md:text-[24px]
          "
        >
          Summary
        </h3>

        {/* TEXT */}
        <div
          className="
            mt-2
            rounded-[20px]
            border
            border-[rgba(6,28,47,0.06)]
            bg-white
            px-4
            py-4
            text-[14px]
            md:text-[17px]
            leading-[1.5]
            text-[#4B5563]
            md:px-5
          "
        >
          Clear visual structure and modern presentation, but weak CTA specificity
          reduces conversion confidence in the first screen experience.
        </div>

        {/* GRID */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">

          {/* LEFT CARD */}
          <div
            className="
              rounded-[24px]
              border
              border-[rgba(6,28,47,0.06)]
              bg-white
              p-4
              md:p-6
            "
          >

            <div className="flex gap-3 md:gap-6 sm:flex-row sm:items-center">

              {/* SCORE */}
              <div className="relative flex h-[110px] w-[110px] shrink-0 items-center justify-center md:h-[120px] md:w-[120px]">

                <svg
                  className="absolute inset-0 -rotate-90"
                  viewBox="0 0 120 120"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    stroke="#E5E7EB"
                    strokeWidth="6"
                    fill="none"
                  />

                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    stroke="#FF7A00"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={327}
                    strokeDashoffset={82}
                  />
                </svg>

                <div className="text-center">
                  <p className="text-[12px] font-semibold text-[#061C2F]">
                    UX Score
                  </p>

                  <p className="mt-1 text-[34px] font-semibold leading-none text-[#FF7A00] md:text-[40px]">
                    75
                  </p>
                </div>
              </div>

              {/* CONTENT */}
              <div className="min-w-0">

                <p
                  className="
                    text-[14px]
                    font-medium
                    leading-[1.35]
                    tracking-[-0.04em]
                    text-[#061C2F]
                    md:text-[20px]
                  "
                >
                  Above average UX quality with moderate conversion friction
                </p>

                <div className="mt-5 space-y-1 text-[11px] text-[#6B7280] md:text-[15px]">

                  <div>
                    <span className="font-semibold text-[#061C2F]">
                      Best:
                    </span>{" "}
                    Navigation clarity
                  </div>

                  <div>
                    <span className="font-semibold text-[#061C2F]">
                      Risk:
                    </span>{" "}
                    Trust positioning
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT CARD */}
          <div
            className="
              rounded-[24px]
              border
              border-[rgba(6,28,47,0.06)]
              bg-white
              p-4
              md:p-6
            "
          >
            <div className="flex h-full flex-col justify-between">

              <div>

                <p className="text-[15px] font-semibold text-[#061C2F]">
                  Conversion Health
                </p>

                <div
                  className="
                    mt-3
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    bg-[#FFF1F1]
                    px-3
                    py-1
                    text-[13px]
                    font-semibold
                    text-[#E45454]
                  "
                >
                  <div className="h-2 w-2 rounded-full bg-[#FF5A5A]" />
                  Fair
                </div>
              </div>

              <p className="mt-4 text-[14px] leading-5 text-[#6B7280] md:text-[15px]">
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
<section className="px-5 pb-10 pt-12 md:px-6 md:pb-8 md:pt-14">
  <div
    className="
      mx-auto
      flex
      max-w-[1040px]
      flex-wrap
      items-center
      justify-center
      gap-2.5
      md:gap-3
    "
  >
    {[
      {
        icon: <RiSearchEyeLine size={15} />,
        label: "Prioritized UX issues",
      },
      {
        icon: <RiSparkling2Line size={15} />,
        label: "AI copy refinement",
      },
      {
        icon: <RiBarChartBoxLine size={15} />,
        label: "Conversion insights",
      },
      {
        icon: <RiMagicLine size={15} />,
        label: "Full-page analysis",
      },
      {
        icon: <RiShieldCheckLine size={15} />,
        label: "Built for product teams",
      },
      {
        icon: <RiArrowRightLine size={15} />,
        label: "Fast visual audit",
      },
    ].map((item) => (
      <div
        key={item.label}
        className="
          group
          inline-flex
          items-center
          gap-2
          rounded-full
          border
          border-[rgba(6,28,47,0.06)]
          bg-white/92
          backdrop-blur-md
          px-4
          py-2.5
          text-[13px]
          font-medium
          text-[#6B7280]
          shadow-[0_6px_24px_rgba(6,28,47,0.04)]
          transition-all
          duration-200
          hover:-translate-y-[1px]
          hover:border-[rgba(83,194,238,0.28)]
          hover:bg-white
          hover:shadow-[0_10px_30px_rgba(83,194,238,0.12)]
          md:px-5
          md:py-3
          md:text-[15px]
        "
      >
        <div
          className="
            flex
            h-6
            w-6
            items-center
            justify-center
            rounded-full
            bg-[#E9F8FF]
            text-[#1696C7]
            transition-colors
            group-hover:bg-[#53C2EE]
            group-hover:text-white
            md:h-7
            md:w-7
          "
        >
          {item.icon}
        </div>

        <span className="whitespace-nowrap">
          {item.label}
        </span>
      </div>
    ))}
  </div>
</section>



{/* FEATURES */}
<section className="px-5 md:px-6 py-14 md:py-20">
  <div className="mx-auto max-w-[960px]">

    {/* SECTION 1 — UX Issues */}
    <div className="mx-auto max-w-[760px] text-center">
      <div className="inline-flex text-[16px] font-semibold text-[#0F7FB3]">
        UX Issues
      </div>

      <h2 className="mt-3 text-[28px] md:text-[42px] font-semibold leading-[1.05] tracking-[-0.05em] text-[#061C2F]">
        Key problems hurting clarity and conversion
      </h2>
    </div>

    <div className="relative max-h-[520px] overflow-hidden [mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)]">
      <div className="mt-8 space-y-5">

        {[1].map((item) => (
          <div
            key={item}
            className="rounded-[28px] border border-[rgba(6,28,47,0.06)] bg-white px-6 py-6 md:px-10 md:py-10"
          >
            <div className="flex flex-col md:flex-row gap-3 md:gap-6">

              <div className="text-[22px] md:text-[34px] font-semibold leading-none tracking-[-0.05em] text-[#D1D5DB]">
                {item}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">

                  <div>
                    <h3 className="text-[20px] md:text-[26px] font-semibold tracking-[-0.03em] text-[#061C2F]">
                      {item === 1
                        ? "Unclear primary CTA hierarchy"
                        : "Navigation menu lacks visual separation"}
                    </h3>

                    <div className="mt-4 hidden md:flex flex-wrap gap-2">
                      <div className="rounded-full border border-[#D8DEE4] bg-[#F5F7F9] px-4 py-2 text-[14px] font-medium text-[#667085]">
                        Weak hierarchy
                      </div>

                      <div className="rounded-full border border-[#D8DEE4] bg-[#F5F7F9] px-4 py-2 text-[14px] font-medium text-[#667085]">
                        Weak CTA
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="rounded-full border border-[#FFD6D6] bg-[#FFF3F3] px-3.5 py-1.5 text-[13px] md:text-[14px] font-semibold text-[#D94848]">
                      -16% clarity
                    </div>

                    <div className="rounded-full border border-[#FFD6D6] bg-[#FFF3F3] px-3.5 py-1.5 text-[13px] md:text-[14px] font-semibold text-[#D94848]">
                      -12% conversion
                    </div>
                  </div>
                </div>

                <div className="mt-7 border-t border-[#E5E7EB] pt-4">
                  <p className="text-[15px] font-semibold text-[#061C2F]">
                    Why it matters
                  </p>

                  <p className="mt-2 max-w-[720px] text-[14px] md:text-[16px] leading-6 md:leading-7 text-[#6B7280]">
                    Clear action hierarchy helps users instantly identify the main
                    interaction and improves conversion confidence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

{/* MORE PILL */}
<div className="flex justify-center pt-2">
  <button
    className="
      rounded-full
      bg-[#F3F4F6]
      px-5
      py-2.5
      text-[14px]
      font-semibold
      text-[#4B5563]
      hover:bg-[#E5E7EB]
      transition
    "
  >
    +4 issues
  </button>
</div>


      </div>
    </div>

    {/* SECTION 2 — Suggested Improvements */}
    <div className="mx-auto max-w-[760px] text-center mt-[40px] md:mt-[120px]">
      <div className="inline-flex text-[16px] font-semibold text-[#0F7FB3]">
        Suggested Improvements
      </div>

      <h2 className="mt-3 text-[28px] md:text-[42px] font-semibold leading-[1.05] tracking-[-0.05em] text-[#061C2F]">
        High-impact fixes to improve the experience
      </h2>
    </div>

    <div className="relative max-h-[520px] overflow-hidden mt-10 [mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)]">
      <div className="space-y-5">

        {[1].map((item) => (
          <div
            key={item}
            className="relative rounded-[28px] border border-[rgba(6,28,47,0.06)] bg-white px-6 py-6 md:px-10 md:py-10"
          >

            {/* pill moved to top-right */}
            <div className="absolute right-6 top-6 md:right-10 md:top-10 rounded-full border border-[#C7EBD6] bg-[#E8F7EE] px-4 py-2 text-[13px] md:text-[14px] font-semibold text-[#2E7D4F] whitespace-nowrap">
              {item === 1 ? "+15% conversion" : "+10% navigation"}
            </div>

            <div className="flex flex-col md:flex-row gap-3 md:gap-6">

              <div className="text-[22px] md:text-[34px] font-semibold leading-none tracking-[-0.05em] text-[#D1D5DB]">
                {item}
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">

                  <div>
                    <h3 className="text-[20px] md:text-[26px] font-semibold tracking-[-0.03em] text-[#061C2F]">
                      {item === 1 ? "Hero Section" : "Top Menu"}
                    </h3>

                    <p className="mt-4 text-[14px] md:text-[17px] text-[#6B7280] max-w-[620px] leading-[1.55] md:leading-[1.6]">
                      {item === 1
                        ? "Make the ‘Download’ button more prominent as the primary CTA by increasing size, contrast, or adding a visual indicator."
                        : "Introduce visual separators or hover effects for menu items to clarify interactivity."}
                    </p>
                  </div>
                </div>

                <div className="mt-7 border-t border-[#E5E7EB] pt-4">
                  <p className="text-[15px] font-semibold text-[#061C2F]">
                    Why it matters
                  </p>

                  <p className="mt-2 text-[14px] md:text-[16px] leading-6 md:leading-7 text-[#6B7280] max-w-[620px]">
                    {item === 1
                      ? "Enhancing CTA visibility directs user focus and improves click-through rates."
                      : "Clearer menu structure improves user orientation and reduces cognitive load."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

<div className="flex justify-center pt-2">
  <button className="rounded-full bg-[#F3F4F6] px-5 py-2.5 text-[14px] font-semibold text-[#4B5563] hover:bg-[#E5E7EB] transition">
    +5 improvements
  </button>
</div>


      </div>
    </div>

    {/* SECTION 3 — Copy Refinement */}
    <div className="mx-auto max-w-[760px] text-center mt-[40px] md:mt-[120px]">
      <div className="inline-flex text-[16px] font-semibold text-[#0F7FB3]">
        Copy Refinement
      </div>

      <h2 className="mt-3 text-[28px] md:text-[42px] font-semibold leading-[1.05] tracking-[-0.05em] text-[#061C2F]">
        Stronger messaging for clearer communication
      </h2>
    </div>

    <div className="relative max-h-[520px] overflow-hidden mt-10 [mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)]">
      <div className="space-y-5">

        {[1].map((item) => (
          <div
            key={item}
            className="relative rounded-[28px] border border-[rgba(6,28,47,0.06)] bg-white px-6 py-6 md:px-10 md:py-10"
          >

            {/* pill moved to top-right */}
            <div className="absolute right-6 top-6 md:right-10 md:top-10 rounded-full border border-[#CFE3FF] bg-[#EAF2FF] px-4 py-2 text-[13px] md:text-[14px] font-semibold text-[#375BE7] whitespace-nowrap">
              {item === 1 ? "+15% clarity" : "+10% conversion"}
            </div>

            <div className="flex flex-col md:flex-row gap-3 md:gap-6">

              <div className="text-[22px] md:text-[34px] font-semibold leading-none tracking-[-0.05em] text-[#D1D5DB]">
                {item}
              </div>

              <div className="flex-1">

                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <h3 className="text-[20px] md:text-[26px] font-semibold tracking-[-0.03em] text-[#061C2F]">
                    {item === 1 ? "Hero Headline" : "Subheadline"}
                  </h3>
                </div>

                {/* BEFORE / AFTER */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* BEFORE */}
                  <div className="rounded-2xl bg-[#F3F5F7] p-4 md:p-5">
                    <div className="flex items-center justify-between">
                      <div className="rounded-full border border-[#D8DEE4] bg-white px-3 py-1 text-[12px] font-medium text-[#667085]">
                        Original
                      </div>
                    </div>

                    <p className="mt-5 text-[14px] md:text-[16px] leading-6 md:leading-7 text-[#667085]">
                      {item === 1
                        ? "Turn waiting into watching."
                        : "Generic subheadline text."}
                    </p>
                  </div>

                  {/* AFTER */}
                  <div className="rounded-2xl bg-[#EAF2FF] p-4 md:p-5">
                    <div className="flex items-center justify-between gap-3">

                      <div className="rounded-full border border-[#CFE3FF] bg-white px-3 py-1 text-[12px] font-semibold text-[#375BE7]">
                        AI Suggestion
                      </div>

                      <div className="relative">
                        <button
                          onClick={() =>
                            handleCopy(
                              item === 1
                                ? "Beautiful Mac Screensavers That Keep Your Screen Alive."
                                : "Clearer, more benefit-driven messaging.",
                              item
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white/70"
                        >
                          {copiedIndex === item ? (
                            <RiCheckLine size={18} />
                          ) : (
                            <RiFileCopyLine size={18} />
                          )}
                        </button>

                        {copiedIndex === item && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md border border-[rgba(0,0,0,0.06)] bg-white px-2 py-1 text-[12px] font-medium text-[#061C2F] shadow-sm">
                            Copied
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="mt-5 text-[14px] md:text-[16px] font-medium leading-6 md:leading-7 text-[#061C2F]">
                      {item === 1
                        ? "Beautiful Mac Screensavers That Keep Your Screen Alive."
                        : "Clearer, more benefit-driven messaging."}
                    </p>
                  </div>

                </div>

                {/* WHY */}
                <div className="mt-7 border-t border-[#E5E7EB] pt-5">
                  <p className="text-[15px] font-semibold text-[#061C2F]">
                    Why it works
                  </p>

                  <p className="mt-2 text-[14px] md:text-[16px] leading-6 md:leading-7 text-[#6B7280] max-w-[720px]">
                    Explicitly states product and benefit, improving immediate comprehension.
                  </p>
                </div>

              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-center pt-2">
  <button className="rounded-full bg-[#F3F4F6] px-5 py-2.5 text-[14px] font-semibold text-[#4B5563] hover:bg-[#E5E7EB] transition">
    +3 refinements
  </button>
</div>


      </div>
    </div>

  </div>
</section>



{/* CTA */}
<section className="px-5 md:px-6 py-14 md:py-24">
  <div
    className="
      relative
      mx-auto
      max-w-[1180px]
      overflow-hidden
      rounded-[40px]
      bg-[#061C2F]
      px-6
      py-16
      md:px-12
      md:py-24
    "
  >

    {/* Glow */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(83,194,238,0.28),transparent_55%)]" />
    <div className="absolute -top-[140px] left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-[#53C2EE]/20 blur-[140px]" />

    <div className="relative z-10 grid gap-12 lg:grid-cols-[1fr_420px] lg:items-center">

      {/* LEFT */}
      <div className="max-w-[620px]">

        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-[#9FC6DB] backdrop-blur-md">
          AI-powered UX reviews
        </div>

        <h2 className="mt-6 text-[40px] md:text-[58px] font-semibold leading-[0.92] tracking-[-0.06em] text-white">
          Find what hurts your conversion
        </h2>

        <p className="mt-6 max-w-[560px] text-[17px] md:text-[19px] leading-8 text-white/70">
          Klynt helps product teams identify friction, improve clarity and optimize conversion before launch.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/analyze"
            className="
              inline-flex
              h-[56px]
              items-center
              gap-2
              rounded-full
              bg-[#53C2EE]
              px-8
              text-[15px]
              font-semibold
              text-[#061C2F]
              transition-all
              duration-200
              hover:-translate-y-[1px]
              hover:shadow-[0_12px_30px_rgba(83,194,238,0.28)]
            "
          >
            Start free audit
            <RiArrowRightLine size={18} />
          </Link>

          <Link
            href="/sample"
            className="
              inline-flex
              h-[56px]
              items-center
              gap-2
              rounded-full
              bg-white/10
              px-8
              text-[15px]
              font-semibold
              text-white
              backdrop-blur-md
              transition-all
              duration-200
              hover:bg-white/20
            "
          >
            View sample report
          </Link>
        </div>

      </div>

      {/* RIGHT MOCKUP IMAGE */}
      <div className="relative hidden lg:block">
        <div
          className="
            absolute
            bottom-0
            right-0
            w-full
            overflow-hidden
            rounded-[32px]
            border border-white/10
            bg-white
            shadow-[0_40px_90px_rgba(0,0,0,0.45)]
          "
        >
          <img
            src="/cta-report.png"
            alt="Clarity Report"
            className="
              w-full
              h-auto
              object-cover
              pointer-events-none
              align-bottom
            "
          />
        </div>
      </div>

    </div>
  </div>
</section>


{/* FOOTER */}
<footer className="bg-[#061C2F] py-10 px-6 md:px-12">
  <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-6 md:flex-row">

    {/* LEFT — LOGO */}
    <div className="text-[18px] font-semibold tracking-[-0.03em] text-white">
      Klynt
    </div>

    {/* RIGHT — LINKS */}
    <div className="flex items-center gap-8 text-[14px] font-medium text-[#8F99A2]">
      <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
      <Link href="/terms" className="hover:text-white transition">Terms</Link>
      <Link href="/contact" className="hover:text-white transition">Contact</Link>
    </div>

  </div>
</footer>

    </main>
  );
}