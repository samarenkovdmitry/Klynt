"use client";

import Link from "next/link";
import {
  RiArrowRightLine,
  RiSearchEyeLine,
  RiSparkling2Line,
  RiMagicLine,
  RiShieldCheckLine,
  RiBarChartBoxLine,
  RiUserSmileLine,
  RiFilePdfLine,
  RiTimerFlashLine,
} from "@remixicon/react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/Button";
import { LandingReportMockup } from "@/components/LandingReportMockup";
import { LandingHeroPattern } from "@/components/LandingHeroPattern";
import { DEMO_REPORT_PATH } from "@/lib/demo-report";

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
    "/avatars/user1.jpg",
    "/avatars/user2.jpg",
    "/avatars/user3.jpg",
  ];

  const howItWorksSteps = [
    {
      title: "Paste your URL",
      description:
        "Enter any live landing page or marketing site. Klynt captures the visible UI and copy — no install or account needed.",
    },
    {
      title: "AI scans the page",
      description:
        "The model reviews hierarchy, messaging, trust signals, and conversion patterns to spot friction across the full page.",
    },
    {
      title: "Review your report",
      description:
        "Get UX issues, prioritized improvements, and copy rewrites in one shareable clarity report — ready to export as PDF.",
    },
  ];


  return (
    <main className="overflow-hidden bg-[#F5F7FA] text-[#061C2F]">
      {/* HERO */}
      <section
        className="
          relative
          overflow-hidden
          bg-[#53C2EE]
          pb-[120px]
          md:pb-[180px]
        "
      >
        <LandingHeroPattern />
        <AppHeader variant="landing" />

        {/* HERO CONTENT */}
        <div className="relative z-10 mx-auto flex max-w-[980px] flex-col items-center px-5 pt-10 text-center md:pt-16">
          <h1
            className="
              max-w-[860px]
              text-[56px]
              font-semibold
              leading-[0.95]
              tracking-[-0.05em]
              text-[#061C2F]
              md:text-[84px]
              md:tracking-[-0.04em]
            "
          >
            Clarity drives conversion
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
            Klynt finds confusing UX, weak positioning and conversion friction on landing pages.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center">
            <Button
              href="/analyze"
              icon={<RiArrowRightLine size={18} />}
              fullWidth={false}
              className="h-[58px] min-h-[58px] px-8 text-[17px]"
            >
              Start free audit
            </Button>

            <div
              className="
                mt-5
                flex
                flex-wrap
                items-center
                justify-center
                gap-x-3
                gap-y-2
                text-[12px]
                text-[#061C2F]/72
                md:text-[13px]
              "
            >
              <div className="flex items-center gap-2">
                <RiUserSmileLine
                  size={16}
                  className="shrink-0 text-[#0B6FA0]"
                />
                <span>No signup required</span>
              </div>

              <div className="hidden h-1 w-1 rounded-full bg-[#061C2F]/25 md:block" />

              <div className="flex items-center gap-2">
                <RiFilePdfLine size={16} className="shrink-0 text-[#0B6FA0]" />
                <span>PDF export</span>
              </div>

              <div className="hidden h-1 w-1 rounded-full bg-[#061C2F]/25 md:block" />

              <div className="flex items-center gap-2">
                <RiTimerFlashLine
                  size={16}
                  className="shrink-0 text-[#0B6FA0]"
                />
                <span>AI-generated in ~15–25 sec</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEMO REPORT */}
      <section
        id="report"
        className="relative z-20 -mt-[70px] px-4 md:-mt-[120px] md:px-6"
      >
        <LandingReportMockup />
      </section>

      {/* FEATURE PILLS */}
      <section className="px-5 pt-12 md:px-6 md:pt-20">
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

      {/* ANALYSIS + SOCIAL PROOF + HOW IT WORKS */}
      <section className="px-5 pt-12 pb-12 md:px-6 md:pt-24 md:pb-28">
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
          <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3">
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

          {/* SOCIAL PROOF */}
          <div
            className="
              mt-12
              rounded-[32px]
              border
              border-[rgba(6,28,47,0.06)]
              bg-white
              px-6
              py-8
              md:mt-24
              md:px-10
              md:py-10
            "
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative z-10 flex -space-x-3">
                {avatars.map((src, i) => (
                  <div
                    key={src}
                    className="
                      relative
                      h-12
                      w-12
                      shrink-0
                      overflow-hidden
                      rounded-full
                      border-2
                      border-white
                      bg-[#E8F0F5]
                      ring-1
                      ring-[rgba(6,28,47,0.06)]
                    "
                    style={{ zIndex: avatars.length - i }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      width={48}
                      height={48}
                      className="block h-full w-full object-cover"
                      loading="eager"
                      decoding="async"
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
                &ldquo;The fastest way to spot UX problems before launch.&rdquo;
              </p>
            </div>
          </div>

          {/* HOW IT WORKS */}
          <div className="mt-12 md:mt-24">
            <div className="mx-auto max-w-[760px] text-center">
              <div className="text-[14px] font-semibold text-[#0F7FB3] md:text-[15px]">
                How it works
              </div>

              <h2
                className="
                  mt-4
                  text-[34px]
                  font-semibold
                  leading-[0.98]
                  tracking-[-0.06em]
                  text-[#061C2F]
                  md:text-[48px]
                "
              >
                Three steps to a clearer page
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
                No setup, no signup. Paste a URL and get a structured report in
                under a minute.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {howItWorksSteps.map((step, index) => (
                <article
                  key={step.title}
                  className="
                    rounded-[28px]
                    border
                    border-[rgba(6,28,47,0.06)]
                    bg-white
                    p-6
                    md:p-7
                  "
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F6FC] text-[15px] font-semibold text-[#0F7FB3]">
                    {index + 1}
                  </div>

                  <h3 className="mt-4 text-[20px] font-semibold leading-[1.2] tracking-[-0.03em] text-[#061C2F] md:text-[22px]">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-[15px] leading-7 text-[#6B7280]">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-12 md:px-6 md:py-28">
        <div
          className="
            relative
            mx-auto
            max-w-[1040px]
            overflow-hidden
            rounded-[28px]
            bg-[#53C2EE]
            px-5
            py-12
            md:rounded-[36px]
            md:px-10
            md:py-16
          "
        >
          <LandingHeroPattern />

          <div className="relative z-10 mx-auto max-w-[760px] text-center">
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
                text-[#061C2F]/72
                md:text-[19px]
              "
            >
              Analyze your interface, uncover UX friction and improve conversion
              with AI-powered insights.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                href="/analyze"
                variant="accent"
                icon={<RiArrowRightLine size={18} />}
                fullWidth={false}
                className="h-[58px] min-h-[58px] px-8 text-[17px]"
              >
                Start free audit
              </Button>

              <Button
                href={DEMO_REPORT_PATH}
                variant="secondary"
                fullWidth={false}
                className="h-[58px] min-h-[58px] px-8 text-[17px]"
              >
                View demo
              </Button>
            </div>

            <div
              className="
                mt-5
                flex
                flex-wrap
                items-center
                justify-center
                gap-x-3
                gap-y-2
                text-[12px]
                text-[#061C2F]/72
                md:text-[13px]
              "
            >
              <div className="flex items-center gap-2">
                <RiUserSmileLine
                  size={16}
                  className="shrink-0 text-[#0B6FA0]"
                />
                <span>No signup required</span>
              </div>

              <div className="hidden h-1 w-1 rounded-full bg-[#061C2F]/25 md:block" />

              <div className="flex items-center gap-2">
                <RiFilePdfLine size={16} className="shrink-0 text-[#0B6FA0]" />
                <span>PDF export</span>
              </div>

              <div className="hidden h-1 w-1 rounded-full bg-[#061C2F]/25 md:block" />

              <div className="flex items-center gap-2">
                <RiTimerFlashLine
                  size={16}
                  className="shrink-0 text-[#0B6FA0]"
                />
                <span>AI-generated in ~15–25 sec</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[rgba(6,28,47,0.06)] px-6 py-8">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-5 md:flex-row">
          <Link href="/" className="shrink-0" aria-label="Klynt — home">
            <img
              src="/klynt-logo-dark.svg"
              alt=""
              className="h-[34px] w-auto md:h-[40px]"
            />
          </Link>

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