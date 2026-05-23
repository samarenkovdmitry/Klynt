"use client";

import Link from "next/link";
import { useState } from "react";

import {
  RiArrowRightLine,
  RiDownload2Line,
  RiSearchEyeLine,
  RiSparkling2Line,
  RiMagicLine,
  RiShieldCheckLine,
  RiBarChartBoxLine,
  RiFileCopyLine,
  RiCheckLine,
} from "@remixicon/react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/Button";

export default function Home() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  async function handleCopy(text: string, index: number) {
    await navigator.clipboard.writeText(text);

    setCopiedIndex(index);

    setTimeout(() => {
      setCopiedIndex(null);
    }, 1500);
  }

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
              className="px-8"
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
              Detect UX friction, improve messaging and prioritize the changes
              that impact clarity and conversion.
            </p>
          </div>

          {/* GRID */}
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {/* CARD 1 */}
            <div
              className="
                rounded-[28px]
                border
                border-[rgba(6,28,47,0.06)]
                bg-white
                p-6
              "
            >
              <div
                className="
                  inline-flex
                  rounded-full
                  bg-[#FFF3F3]
                  px-3
                  py-1
                  text-[12px]
                  font-semibold
                  text-[#D94848]
                "
              >
                UX Issues
              </div>

              <h3
                className="
                  mt-5
                  text-[24px]
                  font-semibold
                  leading-[1.08]
                  tracking-[-0.04em]
                  text-[#061C2F]
                "
              >
                Weak CTA hierarchy
              </h3>

              <p className="mt-4 text-[15px] leading-7 text-[#6B7280]">
                Users may struggle to identify the main action because the
                visual hierarchy lacks emphasis.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <div className="rounded-full bg-[#F3F4F6] px-3 py-1 text-[12px] font-medium text-[#667085]">
                  Clarity
                </div>

                <div className="rounded-full bg-[#F3F4F6] px-3 py-1 text-[12px] font-medium text-[#667085]">
                  Conversion
                </div>
              </div>
            </div>

            {/* CARD 2 */}
            <div
              className="
                rounded-[28px]
                border
                border-[rgba(6,28,47,0.06)]
                bg-white
                p-6
              "
            >
              <div
                className="
                  inline-flex
                  rounded-full
                  bg-[#E8F7EE]
                  px-3
                  py-1
                  text-[12px]
                  font-semibold
                  text-[#2E7D4F]
                "
              >
                Improvements
              </div>

              <h3
                className="
                  mt-5
                  text-[24px]
                  font-semibold
                  leading-[1.08]
                  tracking-[-0.04em]
                  text-[#061C2F]
                "
              >
                Increase CTA contrast
              </h3>

              <p className="mt-4 text-[15px] leading-7 text-[#6B7280]">
                Stronger contrast and spacing improve focus and make the primary
                action easier to notice.
              </p>

              <div
                className="
                  mt-8
                  rounded-2xl
                  bg-[#F7FAF8]
                  px-4
                  py-4
                  text-[14px]
                  font-medium
                  text-[#2E7D4F]
                "
              >
                Estimated impact: +15% conversion
              </div>
            </div>

            {/* CARD 3 */}
            <div
              className="
                rounded-[28px]
                border
                border-[rgba(6,28,47,0.06)]
                bg-white
                p-6
              "
            >
              <div
                className="
                  inline-flex
                  rounded-full
                  bg-[#EAF2FF]
                  px-3
                  py-1
                  text-[12px]
                  font-semibold
                  text-[#375BE7]
                "
              >
                Copy Refinement
              </div>

              <h3
                className="
                  mt-5
                  text-[24px]
                  font-semibold
                  leading-[1.08]
                  tracking-[-0.04em]
                  text-[#061C2F]
                "
              >
                Clearer headline messaging
              </h3>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-[#F3F5F7] p-4">
                  <p className="text-[13px] font-medium text-[#667085]">
                    Original
                  </p>

                  <p className="mt-3 text-[14px] leading-6 text-[#667085]">
                    Turn waiting into watching.
                  </p>
                </div>

                <div className="rounded-2xl bg-[#EAF2FF] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-[#375BE7]">
                      AI Suggestion
                    </p>

                    <button
                      onClick={() =>
                        handleCopy(
                          "Beautiful Mac Screensavers That Keep Your Screen Alive.",
                          1
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/60"
                    >
                      {copiedIndex === 1 ? (
                        <RiCheckLine size={16} />
                      ) : (
                        <RiFileCopyLine size={16} />
                      )}
                    </button>
                  </div>

                  <p className="mt-3 text-[14px] font-medium leading-6 text-[#061C2F]">
                    Beautiful Mac Screensavers That Keep Your Screen Alive.
                  </p>
                </div>
              </div>
            </div>
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