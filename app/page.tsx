"use client";

import Link from "next/link";
import {
  RiArrowRightLine,
  RiDownload2Line,
  RiSearchEyeLine,
  RiSparkling2Line,
  RiMagicLine,
  RiShieldCheckLine,
  RiBarChartBoxLine,
} from "@remixicon/react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/Button";

export default function Home() {
  const pills = [
    {
      icon: <RiSearchEyeLine size={18} className="text-[#1696C7]" />,
      label: "UX issues",
    },
    {
      icon: <RiSparkling2Line size={18} className="text-[#1696C7]" />,
      label: "Copy refinement",
    },
    {
      icon: <RiBarChartBoxLine size={18} className="text-[#1696C7]" />,
      label: "Conversion insights",
    },
    {
      icon: <RiMagicLine size={18} className="text-[#1696C7]" />,
      label: "Full-page analysis",
    },
    {
      icon: <RiShieldCheckLine size={18} className="text-[#1696C7]" />,
      label: "Product teams",
    },
  ];

  const avatars = [
    "/avatars/user1.svg",
    "/avatars/user2.svg",
    "/avatars/user3.svg",
  ];


  return (
    <main className="overflow-hidden bg-[#F5F7FA] text-[#061C2F]">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#53C2EE] pb-[120px] md:pb-[180px]">
        <AppHeader variant="landing" />

        {/* HERO CONTENT */}
        <div className="relative z-10 mx-auto flex max-w-[980px] flex-col items-center px-5 pt-10 text-center md:pt-16">
          <h1
            className="
              max-w-[860px]
              text-[56px]
              font-semibold
              leading-[0.95]
              tracking-[-0.08em]
              text-[#061C2F]
              md:text-[84px]
            "
          >
            Nothing but clarity
          </h1>

          <p
            className="
              mt-6
              max-w-[640px]
              text-[17px]
              leading-8
              text-[#061C2F]/72
              md:text-[21px]
            "
          >
            AI that finds weak points in your UX and copy, explains them,
            and suggests clearer improvements.
          </p>

          <div className="mt-8 flex items-center justify-center">
            <Button
              href="/analyze"
              icon={<RiArrowRightLine size={18} />}
              fullWidth={false}
              className="h-[58px] min-h-[58px] px-8 text-[17px]"
            >
              Start free audit
            </Button>
          </div>
        </div>
      </section>

      {/* FLOATING REPORT */}
      <section
        id="report"
        className="relative z-20 -mt-[70px] px-4 md:-mt-[120px] md:px-6"
      >
        <div
          className="
            relative
            mx-auto
            max-w-[960px]
            overflow-hidden
            rounded-[28px]
            border
            border-[rgba(6,28,47,0.06)]
            bg-white
            shadow-[0_20px_60px_rgba(6,28,47,0.08)]
            md:rounded-[40px]
          "
        >
          <div className="relative z-10 p-4 md:p-8 lg:p-10">
            {/* TOP */}
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2
                    className="
                      text-[28px]
                      font-semibold
                      leading-none
                      tracking-[-0.05em]
                      text-[#061C2F]
                      md:text-[40px]
                    "
                  >
                    Clarity Report
                  </h2>

                  <div
                    className="
                      inline-flex
                      h-[30px]
                      items-center
                      rounded-full
                      bg-[#EEF2FF]
                      px-3
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

                  <span className="hidden text-neutral-300 md:block">•</span>

                  <span>3 screens</span>

                  <span className="hidden text-neutral-300 md:block">•</span>

                  <span>May 19</span>
                </div>
              </div>

              <button
                className="
                  inline-flex
                  h-[48px]
                  w-full
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
                  transition
                  hover:bg-[#F8FAFC]
                  md:w-auto
                "
              >
                <RiDownload2Line size={18} />
                Download PDF
              </button>
            </div>

            {/* SUMMARY */}
            <div className="mt-4 rounded-[24px] bg-[#FBFCFD] p-0 md:mt-8 md:border md:border-[rgba(6,28,47,0.06)] md:p-6">
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

              <div
                className="
                  mt-3
                  rounded-[20px]
                  border
                  border-[rgba(6,28,47,0.06)]
                  bg-white
                  px-4
                  py-4
                  text-[14px]
                  leading-7
                  text-[#4B5563]
                  md:px-5
                  md:text-[16px]
                "
              >
                Clear visual structure and modern presentation, but weak CTA
                specificity reduces conversion confidence in the first screen
                experience.
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
                {/* LEFT */}
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
                  <div className="flex gap-4 md:gap-6">
                    <div className="relative flex h-[110px] w-[110px] shrink-0 items-center justify-center">
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

                        <p className="mt-1 text-[34px] font-semibold leading-none text-[#FF7A00]">
                          75
                        </p>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          text-[18px]
                          font-semibold
                          leading-[1.2]
                          tracking-[-0.04em]
                          text-[#061C2F]
                          md:text-[24px]
                        "
                      >
                        Above average UX quality with moderate conversion
                        friction
                      </p>

                      <div className="mt-5 space-y-1 text-[13px] text-[#6B7280] md:text-[15px]">
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

                {/* RIGHT */}
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

                    <p className="mt-5 text-[14px] leading-6 text-[#6B7280] md:text-[15px]">
                      CTA clarity and trust positioning reduce conversion
                      confidence.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE PILLS */}
      <section className="px-5 pb-6 pt-10 md:px-6 md:pb-10 md:pt-14">
        <div
          className="
            mx-auto
            flex
            max-w-[940px]
            flex-wrap
            items-center
            justify-center
            gap-2
          "
        >
          {pills.map((item) => (
            <div
              key={item.label}
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-[rgba(6,28,47,0.06)]
                bg-white
                px-3.5
                py-2
                text-[12px]
                font-medium
                text-[#6B7280]
                md:px-4
                md:text-[14px]
              "
            >
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>
      </section>

      {/* ANALYSIS */}
      <section className="px-5 py-14 md:px-6 md:py-24">
        <div className="mx-auto max-w-[1040px]">
          {/* HEADER */}
          <div className="mx-auto max-w-[760px] text-center">
            <div className="text-[14px] font-semibold text-[#0F7FB3] md:text-[15px]">
              What Klynt analyzes
            </div>

            <h2
              className="
                mt-4
                text-[34px]
                font-semibold
                leading-[0.98]
                tracking-[-0.06em]
                text-[#061C2F]
                md:text-[54px]
              "
            >
              Clear insights for better product decisions
            </h2>

            <p
              className="
                mx-auto
                mt-5
                max-w-[620px]
                text-[16px]
                leading-8
                text-[#6B7280]
              "
            >
              Every report breaks your page into three parts — what&apos;s wrong,
              what to change, and how to rewrite the words.
            </p>
          </div>

          {/* BENTO GRID */}
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {/* UX ISSUES */}
            <article
              className="
                flex
                flex-col
                overflow-hidden
                rounded-[28px]
                border
                border-[rgba(6,28,47,0.06)]
                bg-white
              "
            >
              <div className="flex flex-1 flex-col p-6 pb-5">
                <div className="inline-flex w-fit rounded-full bg-[#FFF3F3] px-3 py-1 text-[12px] font-semibold text-[#D94848]">
                  UX Issues
                </div>

                <h3 className="mt-4 text-[22px] font-semibold leading-[1.12] tracking-[-0.04em] text-[#061C2F]">
                  See what slows users down
                </h3>

                <p className="mt-3 text-[15px] leading-7 text-[#6B7280]">
                  Klynt flags problems in hierarchy, navigation, trust, and
                  conversion — each with a short explanation of why it matters
                  for your specific page.
                </p>
              </div>

              <div
                className="
                  flex
                  h-[148px]
                  items-center
                  justify-center
                  bg-red-100
                  px-5
                "
              >
                <div
                  className="
                    w-full
                    max-w-[260px]
                    rounded-2xl
                    border
                    border-[rgba(6,28,47,0.06)]
                    bg-white
                    p-3.5
                    shadow-sm
                  "
                >
                  <div className="h-2 w-16 rounded-full bg-[#E5E7EB]" />
                  <div className="mt-2.5 h-2.5 w-[85%] rounded-full bg-[#E5E7EB]" />
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-500">
                      -12% conversion
                    </span>
                    <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-medium text-[#667085]">
                      Weak CTA
                    </span>
                  </div>
                </div>
              </div>
            </article>

            {/* IMPROVEMENTS */}
            <article
              className="
                flex
                flex-col
                overflow-hidden
                rounded-[28px]
                border
                border-[rgba(6,28,47,0.06)]
                bg-white
              "
            >
              <div className="flex flex-1 flex-col p-6 pb-5">
                <div className="inline-flex w-fit rounded-full bg-[#E8F7EE] px-3 py-1 text-[12px] font-semibold text-[#2E7D4F]">
                  Improvements
                </div>

                <h3 className="mt-4 text-[22px] font-semibold leading-[1.12] tracking-[-0.04em] text-[#061C2F]">
                  Know what to fix first
                </h3>

                <p className="mt-3 text-[15px] leading-7 text-[#6B7280]">
                  Get prioritized recommendations tied to real sections of
                  your UI — layout, CTA placement, trust blocks — with estimated
                  impact on clarity and conversion.
                </p>
              </div>

              <div
                className="
                  flex
                  h-[148px]
                  items-center
                  justify-center
                  bg-emerald-100
                  px-5
                "
              >
                <div className="w-full max-w-[260px] space-y-2">
                  <div
                    className="
                      flex
                      items-center
                      gap-2.5
                      rounded-xl
                      border
                      border-[rgba(6,28,47,0.05)]
                      bg-white
                      px-3
                      py-2.5
                      shadow-sm
                    "
                  >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                      1
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="h-2 w-full max-w-[120px] rounded-full bg-[#E5E7EB]" />
                    </div>
                    <span className="shrink-0 text-[10px] font-semibold text-emerald-600">
                      +15%
                    </span>
                  </div>

                  <div
                    className="
                      flex
                      items-center
                      gap-2.5
                      rounded-xl
                      border
                      border-[rgba(6,28,47,0.05)]
                      bg-white
                      px-3
                      py-2.5
                      shadow-sm
                    "
                  >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                      2
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="h-2 w-full max-w-[100px] rounded-full bg-[#E5E7EB]" />
                    </div>
                    <span className="shrink-0 text-[10px] font-semibold text-emerald-600">
                      +15%
                    </span>
                  </div>
                </div>
              </div>
            </article>

            {/* COPY REFINEMENT */}
            <article
              className="
                flex
                flex-col
                overflow-hidden
                rounded-[28px]
                border
                border-[rgba(6,28,47,0.06)]
                bg-white
              "
            >
              <div className="flex flex-1 flex-col p-6 pb-5">
                <div className="inline-flex w-fit rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[12px] font-semibold text-sky-700">
                  Copy Refinement
                </div>

                <h3 className="mt-4 text-[22px] font-semibold leading-[1.12] tracking-[-0.04em] text-[#061C2F]">
                  Rewrite vague copy
                </h3>

                <p className="mt-3 text-[15px] leading-7 text-[#6B7280]">
                  Headlines, CTAs, and section text get before/after suggestions
                  that explain what you sell, who it&apos;s for, and what to do
                  next — without generic marketing fluff.
                </p>
              </div>

              <div
                className="
                  flex
                  h-[148px]
                  items-center
                  justify-center
                  bg-sky-100
                  px-5
                "
              >
                <div className="flex w-full max-w-[260px] flex-col justify-center gap-2">
                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
                      Before
                    </p>
                    <p className="mt-1 text-[11px] leading-snug text-neutral-600">
                      Turn waiting into watching.
                    </p>
                  </div>

                  <div className="rounded-xl border border-sky-200 bg-sky-50/70 px-3 py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-sky-700">
                        After
                      </p>
                      <span className="shrink-0 rounded-full border border-sky-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                        +15% clarity
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] font-medium leading-snug text-[var(--ink-primary)]">
                      Mac screensavers that keep your display alive.
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="px-5 py-6 md:px-6 md:py-12">
        <div
          className="
            mx-auto
            max-w-[920px]
            rounded-[32px]
            border
            border-[rgba(6,28,47,0.06)]
            bg-white
            px-6
            py-8
            md:px-10
            md:py-10
          "
        >
          <div className="flex flex-col items-center text-center">
            <div className="flex -space-x-3">
              {avatars.map((src, i) => (
                <div
                  key={i}
                  className="
                    h-12
                    w-12
                    rounded-full
                    border-2
                    border-white
                    overflow-hidden
                    bg-gray-100
                  "
                >
                    <img
                      src={src}
                      alt="avatar"
                      className="h-full w-full object-cover"
                    />
             </div>
              ))}
            </div>

            <p className="mt-6 text-[15px] font-medium text-[#0F7FB3]">
              Used by designers, founders and product teams
            </p>

            <p
              className="
                mt-4
                max-w-[620px]
                text-[24px]
                font-semibold
                leading-[1.2]
                tracking-[-0.04em]
                text-[#061C2F]
                md:text-[32px]
              "
            >
              “The fastest way to spot UX problems before launch.”
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-14 md:px-6 md:py-24">
        <div className="mx-auto max-w-[860px] text-center">
          <h2
            className="
              text-[42px]
              font-semibold
              leading-[0.95]
              tracking-[-0.06em]
              text-[#061C2F]
              md:text-[72px]
            "
          >
            Improve clarity before shipping
          </h2>

          <p
            className="
              mx-auto
              mt-6
              max-w-[620px]
              text-[17px]
              leading-8
              text-[#6B7280]
              md:text-[19px]
            "
          >
            Analyze your interface, uncover UX friction and improve conversion
            with AI-powered insights.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              href="/analyze"
              icon={<RiArrowRightLine size={18} />}
              fullWidth={false}
              className="px-8"
            >
              Start free audit
            </Button>

            <Button href="#report" variant="secondary" fullWidth={false} className="px-8">
              View demo
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[rgba(6,28,47,0.06)] px-6 py-8">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-5 md:flex-row">
          <div className="text-[18px] font-semibold tracking-[-0.03em] text-[#061C2F]">
            Klynt
          </div>

          <div className="flex items-center gap-7 text-[14px] font-medium text-[#8F99A2]">
            <Link href="/privacy" className="transition hover:text-[#061C2F]">
              Privacy
            </Link>

            <Link href="/terms" className="transition hover:text-[#061C2F]">
              Terms
            </Link>

            <Link href="/contact" className="transition hover:text-[#061C2F]">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}