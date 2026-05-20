import Link from "next/link";
import {
RiArrowRightLine,
RiSparkling2Line,
RiSearch2Line,
RiFlashlightLine,
RiFileCopyLine,
RiCheckboxCircleFill,
} from "@remixicon/react";

export default function Home() {
return ( <main className="bg-[#F5F7FA] text-[#061C2F] overflow-hidden">


  {/* NAVBAR */}
  <header className="relative z-50 px-8 pt-8">
    <div className="mx-auto flex max-w-[1400px] items-center justify-between">

      {/* LOGO */}
      <Link href="/" className="flex items-center">
        <img
          src="/klynt-logo-dark.svg"
          alt="Klynt"
          className="h-[46px] w-auto"
        />
      </Link>

      {/* RIGHT */}
      <button
        className="text-[15px] font-medium text-[#061C2F] opacity-70 transition hover:opacity-100"
      >
        Examples
      </button>
    </div>
  </header>


  {/* HERO */}
  <section className="relative px-5 pb-0 pt-6">

    <div
      className="
        relative
        mx-auto
        max-w-[1760px]
        overflow-hidden
        rounded-[56px]
        bg-[#123453]
        px-[84px]
        pt-[110px]
        min-h-[980px]
      "
    >

      {/* GLOW */}
      <div className="absolute left-[120px] top-[180px] h-[500px] w-[500px] rounded-full bg-[#14A8E8]/[0.16] blur-[120px]" />

      {/* CONTENT */}
      <div className="relative z-10 grid grid-cols-[620px_1fr] items-start gap-20">

        {/* LEFT */}
        <div className="max-w-[620px] pt-10">

          {/* PILL */}
          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-white/8
              px-5
              py-3
              text-[16px]
              font-medium
              text-white
              backdrop-blur-sm
            "
          >
            <RiSparkling2Line size={18} />
            AI UX intelligence
          </div>

          {/* TITLE */}
          <h1
            className="
              mt-10
              text-[100px]
              font-semibold
              leading-[0.9]
              tracking-[-0.07em]
              text-white
            "
          >
            Ship clearer
            <br />
            experiences faster
          </h1>

          {/* DESCRIPTION */}
          <p
            className="
              mt-10
              max-w-[620px]
              text-[28px]
              leading-[1.65]
              tracking-[-0.03em]
              text-white/68
            "
          >
            Klynt helps product teams identify friction,
            improve clarity and optimize conversion before launch.
          </p>

          {/* CTA */}
          <div className="mt-14 flex items-center gap-5">

            <Link
              href="/analyze"
              className="
                inline-flex
                h-[74px]
                items-center
                justify-center
                rounded-full
                bg-[#14A8E8]
                px-10
                text-[22px]
                font-semibold
                text-white
                shadow-[0_20px_80px_rgba(20,168,232,0.35)]
                transition-all
                duration-300
                hover:translate-y-[-2px]
                hover:bg-[#2CC2FF]
              "
            >
              Start free audit
            </Link>

          </div>
        </div>


        {/* RIGHT MOCKUP */}
        <div className="relative pt-10">

          <div
            className="
              overflow-hidden
              rounded-[40px]
              border
              border-[rgba(0,0,0,0.06)]
              bg-white
              shadow-[0_40px_120px_rgba(0,0,0,0.22)]
            "
          >
            <img
              src="/report-preview.png"
              alt="Clarity Report"
              className="w-full"
            />
          </div>

        </div>
      </div>
    </div>


    {/* FLOATING REPORT OVERLAP */}
    <div className="relative z-20 mx-auto -mt-[280px] max-w-[1320px] px-10">
      <div
        className="
          overflow-hidden
          rounded-[40px]
          border
          border-[rgba(0,0,0,0.06)]
          bg-white
          shadow-[0_40px_120px_rgba(0,0,0,0.18)]
        "
      >
        <img
          src="/report-preview-large.png"
          alt="Clarity Report"
          className="w-full"
        />
      </div>
    </div>


    {/* PILLS */}
    <div className="relative z-20 mx-auto mt-12 flex max-w-[1200px] flex-wrap items-center justify-center gap-4 px-8">

      {[
        ["Prioritized UX issues", RiSearch2Line],
        ["Full-page screenshot analysis", RiFlashlightLine],
        ["Conversion-focused insights", RiCheckboxCircleFill],
        ["AI copy refinement", RiFileCopyLine],
      ].map(([label, Icon]: any, i) => (
        <div
          key={i}
          className="
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-[#D7EAF4]
            bg-white
            px-5
            py-3
            text-[15px]
            font-medium
            text-[#0E7490]
            shadow-[0_4px_18px_rgba(0,0,0,0.03)]
          "
        >
          <Icon size={16} />
          {label}
        </div>
      ))}
    </div>
  </section>


  {/* UX ISSUES */}
  <section className="mx-auto mt-36 max-w-[1120px] px-8">

    <div className="mb-10 flex justify-center">
      <div className="rounded-full bg-[#54CDF7] px-4 py-2 text-[12px] font-semibold text-[#061C2F]">
        1. UX Issues
      </div>
    </div>

    <h2 className="mx-auto max-w-[860px] text-center text-[64px] font-semibold leading-[1] tracking-[-0.06em] text-[#061C2F]">
      Key problems hurting clarity and conversion
    </h2>


    {/* STACK */}
    <div className="relative mt-16 space-y-5 overflow-hidden">

      {/* CARD 1 */}
      <div className="rounded-[32px] border border-[#E4E8EC] bg-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.03)]">

        <div className="flex gap-6">
          <div className="w-[34px] text-[36px] font-semibold text-[#D4D9DE]">
            1
          </div>

          <div className="flex-1">

            <div className="flex items-start justify-between gap-6">

              <div>
                <h3 className="text-[28px] font-semibold tracking-[-0.03em] text-[#061C2F]">
                  Unclear primary CTA hierarchy
                </h3>

                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="rounded-full border border-[#E7EAEE] bg-[#FAFBFC] px-3 py-1 text-[12px] font-medium text-[#7D8A96]">
                    Weak hierarchy
                  </div>

                  <div className="rounded-full border border-[#E7EAEE] bg-[#FAFBFC] px-3 py-1 text-[12px] font-medium text-[#7D8A96]">
                    Weak CTA
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <div className="rounded-full border border-[#FFD9D9] bg-[#FFF5F5] px-3 py-2 text-[12px] font-semibold text-[#FF6B6B]">
                  -15% clarity
                </div>

                <div className="rounded-full border border-[#FFD9D9] bg-[#FFF5F5] px-3 py-2 text-[12px] font-semibold text-[#FF6B6B]">
                  -12% conversion
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-[#EEF1F4] pt-6">
              <p className="text-[15px] font-semibold text-[#061C2F]">
                Why it works
              </p>

              <p className="mt-2 text-[17px] leading-8 text-[#7D8A96]">
                Clear visual hierarchy helps users quickly identify the main action.
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* CARD 2 */}
      <div className="relative overflow-hidden rounded-[32px] border border-[#E4E8EC] bg-white p-8 opacity-95">
        <div className="flex gap-6">
          <div className="w-[34px] text-[36px] font-semibold text-[#D4D9DE]">
            2
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h3 className="text-[28px] font-semibold tracking-[-0.03em] text-[#061C2F]">
                  Navigation items lack visual separation
                </h3>
              </div>

              <div className="rounded-full border border-[#FFD9D9] bg-[#FFF5F5] px-3 py-2 text-[12px] font-semibold text-[#FF6B6B]">
                -8% navigation
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[180px] bg-gradient-to-b from-transparent to-[#F5F7FA]" />
      </div>
    </div>
  </section>


  {/* IMPROVEMENTS */}
  <section className="mx-auto mt-44 max-w-[1120px] px-8">

    <div className="mb-10 flex justify-center">
      <div className="rounded-full bg-[#54CDF7] px-4 py-2 text-[12px] font-semibold text-[#061C2F]">
        2. Suggested Improvements
      </div>
    </div>

    <h2 className="mx-auto max-w-[900px] text-center text-[64px] font-semibold leading-[1] tracking-[-0.06em] text-[#061C2F]">
      High-impact fixes to improve the experience
    </h2>

    <div className="relative mt-16 space-y-5 overflow-hidden">

      <div className="rounded-[32px] border border-[#E4E8EC] bg-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.03)]">
        <div className="flex gap-6">
          <div className="w-[34px] text-[36px] font-semibold text-[#D4D9DE]">
            1
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[15px] font-medium uppercase tracking-[0.08em] text-[#9BA6B2]">
                  Hero section
                </p>

                <h3 className="mt-3 text-[28px] font-semibold tracking-[-0.03em] text-[#061C2F]">
                  Make the primary CTA more visually dominant
                </h3>

                <p className="mt-4 max-w-[760px] text-[18px] leading-8 text-[#7D8A96]">
                  Increase contrast and visual emphasis to improve click-through rates.
                </p>
              </div>

              <div className="rounded-full border border-[#D7F3DF] bg-[#F3FFF7] px-3 py-2 text-[12px] font-semibold text-[#2AA865]">
                +16% conversion
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="relative overflow-hidden rounded-[32px] border border-[#E4E8EC] bg-white p-8 opacity-95">
        <div className="flex gap-6">
          <div className="w-[34px] text-[36px] font-semibold text-[#D4D9DE]">
            2
          </div>

          <div className="flex-1">
            <h3 className="text-[28px] font-semibold tracking-[-0.03em] text-[#061C2F]">
              Improve spacing rhythm in navigation
            </h3>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[180px] bg-gradient-to-b from-transparent to-[#F5F7FA]" />
      </div>
    </div>
  </section>


  {/* COPY */}
  <section className="mx-auto mt-44 max-w-[1120px] px-8">

    <div className="mb-10 flex justify-center">
      <div className="rounded-full bg-[#54CDF7] px-4 py-2 text-[12px] font-semibold text-[#061C2F]">
        3. Copy Refinement
      </div>
    </div>

    <h2 className="mx-auto max-w-[920px] text-center text-[64px] font-semibold leading-[1] tracking-[-0.06em] text-[#061C2F]">
      Stronger messaging for clearer, more persuasive communication
    </h2>


    <div className="relative mt-16 space-y-5 overflow-hidden">

      <div className="rounded-[32px] border border-[#E4E8EC] bg-white p-8 shadow-[0_8px_40px_rgba(0,0,0,0.03)]">

        <div className="flex gap-6">
          <div className="w-[34px] text-[36px] font-semibold text-[#D4D9DE]">
            1
          </div>

          <div className="flex-1">

            <div className="flex items-start justify-between gap-6">

              <div>
                <p className="text-[14px] font-medium uppercase tracking-[0.08em] text-[#9BA6B2]">
                  Hero headline
                </p>

                <h3 className="mt-3 text-[28px] font-semibold tracking-[-0.03em] text-[#061C2F]">
                  Improve clarity and conversion intent
                </h3>
              </div>

              <div className="flex gap-2">
                <div className="rounded-full border border-[#D7F3DF] bg-[#F3FFF7] px-3 py-2 text-[12px] font-semibold text-[#2AA865]">
                  +15% clarity
                </div>

                <div className="rounded-full border border-[#D7F3DF] bg-[#F3FFF7] px-3 py-2 text-[12px] font-semibold text-[#2AA865]">
                  +9% conversion
                </div>
              </div>
            </div>


            <div className="mt-8 grid gap-4 md:grid-cols-2">

              {/* BEFORE */}
              <div className="rounded-[22px] border border-[#E7EAEE] bg-[#FBFCFD] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9AA5B1]">
                  Before
                </p>

                <p className="mt-4 text-[20px] leading-8 text-[#7D8A96]">
                  Turn waiting into watching.
                </p>
              </div>


              {/* AFTER */}
              <div className="rounded-[22px] border border-[#DDEFF7] bg-[#F7FCFF] p-5">

                <div className="flex items-center justify-between gap-4">

                  <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F8FF] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#149AD6]">
                    Improved
                  </div>

                  <button className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DCEAF2] bg-white text-[#061C2F] transition hover:bg-[#F3F7FA]">
                    <RiFileCopyLine size={18} />
                  </button>
                </div>

                <p className="mt-5 text-[20px] font-medium leading-8 text-[#061C2F]">
                  Beautiful Mac screensavers that keep your screen alive.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="relative overflow-hidden rounded-[32px] border border-[#E4E8EC] bg-white p-8 opacity-95">
        <div className="flex gap-6">
          <div className="w-[34px] text-[36px] font-semibold text-[#D4D9DE]">
            2
          </div>

          <div className="flex-1">
            <h3 className="text-[28px] font-semibold tracking-[-0.03em] text-[#061C2F]">
              Clarify product outcome in CTA copy
            </h3>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[180px] bg-gradient-to-b from-transparent to-[#F5F7FA]" />
      </div>
    </div>
  </section>


  {/* DARK CTA */}
  <section className="px-5 pb-6 pt-44">

    <div
      className="
        relative
        mx-auto
        grid
        max-w-[1760px]
        grid-cols-[1fr_520px]
        overflow-hidden
        rounded-[56px]
        bg-[#071B2C]
        px-[84px]
        py-[84px]
      "
    >

      {/* GLOW */}
      <div className="absolute left-[120px] top-[80px] h-[420px] w-[420px] rounded-full bg-[#14A8E8]/20 blur-[120px]" />

      {/* LEFT */}
      <div className="relative z-10 max-w-[760px]">

        <div className="inline-flex items-center gap-2 rounded-full bg-white/8 px-5 py-3 text-[15px] font-medium text-white backdrop-blur-sm">
          <RiSparkling2Line size={16} />
          AI-powered UX reviews
        </div>

        <h2 className="mt-10 text-[78px] font-semibold leading-[0.94] tracking-[-0.06em] text-white">
          Improve clarity
          <br />
          before shipping
        </h2>

        <p className="mt-8 max-w-[640px] text-[24px] leading-[1.7] text-white/68">
          Analyze your product with AI and uncover friction, hierarchy issues and weak conversion flows before launch.
        </p>

        <div className="mt-14">
          <Link
            href="/analyze"
            className="
              inline-flex
              h-[74px]
              items-center
              justify-center
              rounded-full
              bg-[#14A8E8]
              px-10
              text-[22px]
              font-semibold
              text-white
              shadow-[0_20px_80px_rgba(20,168,232,0.35)]
              transition-all
              duration-300
              hover:translate-y-[-2px]
              hover:bg-[#2CC2FF]
            "
          >
            Start free audit
          </Link>
        </div>
      </div>


      {/* RIGHT FLOATING */}
      <div className="relative flex items-center justify-end">

        <div className="absolute right-[40px] top-[40px] h-[260px] w-[260px] rounded-full bg-[#14A8E8]/20 blur-[90px]" />

        <div className="relative z-10 w-[480px] rotate-[5deg] overflow-hidden rounded-[32px] border border-white/10 bg-[#0F2436] shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
          <img
            src="/report-preview-dark.png"
            alt="Report preview"
            className="w-full opacity-95"
          />
        </div>
      </div>
    </div>
  </section>
</main>

);
}
