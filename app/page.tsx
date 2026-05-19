import Link from "next/link";
import {
  RiArrowRightUpLine,
  RiSparkling2Line,
  RiScan2Line,
  RiFlashlightLine,
  RiLineChartLine,
  RiLayout4Line,
  RiCheckLine,
} from "@remixicon/react";

export default function Home() {
  return (
    <main className="relative overflow-hidden bg-[#F5F7FA] text-[#061C2F]">

      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* TOP BLUE GLOW */}
        <div
          className="
            absolute
            left-1/2
            top-[-280px]
            h-[700px]
            w-[1000px]
            -translate-x-1/2
            rounded-full
            bg-[radial-gradient(circle,rgba(20,168,232,0.22)_0%,rgba(20,168,232,0)_72%)]
          "
        />

        {/* SIDE LIGHT */}
        <div
          className="
            absolute
            right-[-220px]
            top-[240px]
            h-[520px]
            w-[520px]
            rounded-full
            bg-[radial-gradient(circle,rgba(95,180,255,0.18)_0%,transparent_70%)]
          "
        />

      </div>

      {/* NAVBAR */}
      <header
        className="
          sticky
          top-0
          z-50
          border-b
          border-[rgba(6,28,47,0.05)]
          bg-[rgba(245,247,250,0.82)]
          backdrop-blur-xl
        "
      >
        <div className="mx-auto flex h-[74px] max-w-[1240px] items-center justify-between px-8">

          {/* LOGO */}
          <div className="flex items-center gap-3">

            <svg width="118" height="44" viewBox="0 0 118 44" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="0.5" y="2.5" width="39" height="39" rx="9.5" stroke="#DCE2E7"/>
<path d="M25.6568 30.4854L19.9999 36.1422L20 24.8285L25.6568 30.4854ZM34.1421 22.0001L27.5426 28.5995L20.9433 22.0001L27.5427 15.4006L34.1421 22.0001ZM17.1715 33.3138L5.85791 22L17.1716 10.6863L17.1715 33.3138ZM25.6569 13.5148L20 19.1716L20 7.85786L25.6569 13.5148Z" fill="#061C2F"/>
<path d="M109.419 19.0976V32.4413H113.348V19.0976H117.049V16.0782H113.348V11.3706L109.419 12.0849V16.0782H106.595V19.0976H109.419Z" fill="#061C2F"/>
<path d="M91.8683 32.4411V16.0781H95.6019V19.2598H95.6993C96.0456 18.1559 96.6516 17.2901 97.5174 16.6625C98.4048 16.0131 99.4654 15.6885 100.699 15.6885C101.738 15.6885 102.679 15.9266 103.524 16.4027C104.368 16.8573 105.05 17.5499 105.569 18.4806C106.088 19.4113 106.348 20.6017 106.348 22.0519V32.4411H102.42V22.7012C102.42 21.5108 102.128 20.5909 101.543 19.9416C100.98 19.2922 100.245 18.9676 99.3355 18.9676C98.2316 18.9676 97.3659 19.368 96.7382 20.1688C96.1105 20.9697 95.7967 22.0411 95.7967 23.383V32.4411H91.8683Z" fill="#061C2F"/>
<path d="M74.3423 16.0781H78.4979L82.7835 30.623H82.8484L87.1015 16.0781H91.1273L84.1146 38.1552H80.2511L82.3614 31.8892H79.3745L74.3423 16.0781Z" fill="#061C2F"/>
<path d="M69.7028 32.4413V9.84473H73.6312V32.4413H69.7028Z" fill="#061C2F"/>
<path d="M63.8504 10.3643H68.4606L59.5648 22.3443L59.7596 19.7795L68.7852 32.4414H64.0127L56.2208 21.1755L63.8504 10.3643ZM52.0002 10.3643H56.026V32.4414H52.0002V10.3643Z" fill="#061C2F"/>
</svg>
            </div>

          {/* NAV */}
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-[14px] font-medium text-[#5E6B76] transition hover:text-[#061C2F]"
            >
              Features
            </a>

            <a
              href="#workflow"
              className="text-[14px] font-medium text-[#5E6B76] transition hover:text-[#061C2F]"
            >
              Workflow
            </a>

            <a
              href="#faq"
              className="text-[14px] font-medium text-[#5E6B76] transition hover:text-[#061C2F]"
            >
              FAQ
            </a>
          </div>

          {/* CTA */}
          <Link
            href="/analyze"
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-[#14A8E8]
              px-5
              py-3
              text-[14px]
              font-semibold
              text-white
              shadow-[0_12px_30px_rgba(20,168,232,0.32)]
              transition-all
              duration-200
              hover:-translate-y-[1px]
              hover:shadow-[0_18px_40px_rgba(20,168,232,0.4)]
            "
          >
            Start audit
            <RiArrowRightUpLine size={18} />
          </Link>

        </div>
      </header>

      {/* HERO */}
      <section className="relative">

        <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-14 px-8 pb-24 pt-24 lg:grid-cols-[1.05fr_0.95fr]">

          {/* LEFT */}
          <div className="relative z-10">

            {/* TAG */}
            <div
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-[#D9E9FF]
                bg-[rgba(255,255,255,0.7)]
                px-4
                py-2
                backdrop-blur
              "
            >
              <div className="h-2 w-2 rounded-full bg-[#14A8E8]" />

              <span className="text-[13px] font-semibold text-[#2A6CEB]">
                AI-powered UX clarity analysis
              </span>
            </div>

            {/* TITLE */}
            <h1
              className="
                mt-7
                max-w-[760px]
                text-[58px]
                font-semibold
                leading-[0.95]
                tracking-[-0.06em]
                text-[#061C2F]
              "
            >
              Find conversion friction before users leave.
            </h1>

            {/* SUB */}
            <p
              className="
                mt-8
                max-w-[620px]
                text-[20px]
                leading-9
                text-[#60707C]
              "
            >
              Klynt analyzes your website like a senior UX consultant —
              detecting weak hierarchy, unclear messaging, trust gaps and
              conversion blockers in seconds.
            </p>

            {/* CTA */}
            <div className="mt-10 flex flex-wrap items-center gap-4">

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
                  shadow-[0_16px_40px_rgba(20,168,232,0.35)]
                  transition-all
                  duration-200
                  hover:-translate-y-[2px]
                "
              >
                Analyze website
                <RiArrowRightUpLine size={20} />
              </Link>

              <div className="flex items-center gap-3 rounded-full bg-white px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full bg-[#D7EFFF]" />
                  <div className="h-8 w-8 rounded-full bg-[#C9E8FF]" />
                  <div className="h-8 w-8 rounded-full bg-[#B7DEFF]" />
                </div>

                <div className="leading-none">
                  <p className="text-[13px] font-semibold">
                    UX teams & founders
                  </p>

                  <p className="mt-1 text-[12px] text-[#7B8A97]">
                    use Klynt to improve conversion clarity
                  </p>
                </div>
              </div>

            </div>

            {/* STATS */}
            <div className="mt-14 grid grid-cols-3 gap-4">

              {[
                ["+31%", "Avg. CTA improvement"],
                ["5 min", "Audit generation"],
                ["AI", "UX reasoning engine"],
              ].map((item, index) => (
                <div
                  key={index}
                  className="
                    rounded-[28px]
                    border
                    border-[rgba(6,28,47,0.05)]
                    bg-[rgba(255,255,255,0.7)]
                    px-5
                    py-5
                    backdrop-blur
                  "
                >
                  <p className="text-[28px] font-semibold tracking-[-0.04em]">
                    {item[0]}
                  </p>

                  <p className="mt-2 text-[14px] text-[#71808D]">
                    {item[1]}
                  </p>
                </div>
              ))}

            </div>

          </div>

          {/* RIGHT VISUAL */}
          <div className="relative flex items-center justify-center">

            {/* MAIN CARD */}
            <div
              className="
                relative
                w-full
                max-w-[560px]
                overflow-hidden
                rounded-[38px]
                border
                border-[rgba(6,28,47,0.05)]
                bg-white
                p-6
                shadow-[0_40px_100px_rgba(10,30,60,0.10)]
              "
            >

              {/* TOP BAR */}
              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="h-3 w-3 rounded-full bg-[#14A8E8]" />
                  <div className="h-3 w-3 rounded-full bg-[#D9EFFF]" />
                  <div className="h-3 w-3 rounded-full bg-[#EEF6FF]" />

                </div>

                <div
                  className="
                    rounded-full
                    bg-[#EEF8FF]
                    px-3
                    py-1
                    text-[12px]
                    font-semibold
                    text-[#1593CB]
                  "
                >
                  AI analysis running
                </div>
              </div>

              {/* SCREEN */}
              <div
                className="
                  mt-6
                  overflow-hidden
                  rounded-[26px]
                  border
                  border-[#E6EDF4]
                  bg-[#F7FAFD]
                  p-5
                "
              >

                {/* HEADER */}
                <div className="flex items-center justify-between">

                  <div>
                    <div className="h-4 w-28 rounded-full bg-[#061C2F]" />

                    <div className="mt-3 h-3 w-44 rounded-full bg-[#D7E6F3]" />
                  </div>

                  <div className="rounded-full bg-[#14A8E8] px-4 py-2 text-[12px] font-semibold text-white">
                    Analyze
                  </div>

                </div>

                {/* BLOCKS */}
                <div className="mt-8 space-y-4">

                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="
                        rounded-2xl
                        border
                        border-[#E6EDF4]
                        bg-white
                        p-4
                      "
                    >
                      <div className="flex items-start justify-between">

                        <div>
                          <div className="h-3 w-32 rounded-full bg-[#061C2F]" />

                          <div className="mt-3 h-3 w-52 rounded-full bg-[#DCE7F2]" />

                          <div className="mt-2 h-3 w-40 rounded-full bg-[#E7EFF6]" />
                        </div>

                        <div className="rounded-full bg-[#EFF8FF] px-3 py-1 text-[11px] font-semibold text-[#1593CB]">
                          +18% clarity
                        </div>

                      </div>
                    </div>
                  ))}

                </div>

              </div>

              {/* FLOATING BADGE */}
              <div
                className="
                  absolute
                  -left-8
                  top-20
                  rounded-[26px]
                  border
                  border-[#D9E9FF]
                  bg-white
                  px-5
                  py-4
                  shadow-[0_20px_50px_rgba(20,168,232,0.18)]
                "
              >
                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-2xl
                      bg-[#EEF8FF]
                    "
                  >
                    <RiLineChartLine size={20} className="text-[#14A8E8]" />
                  </div>

                  <div>
                    <p className="text-[13px] font-semibold">
                      UX Score
                    </p>

                    <p className="mt-1 text-[24px] font-semibold text-[#14A8E8]">
                      82
                    </p>
                  </div>

                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="pb-24">

        <div className="mx-auto max-w-[1240px] px-8">

          <div className="mb-14 max-w-[700px]">
            <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#14A8E8]">
              Features
            </p>

            <h2 className="mt-5 text-[48px] font-semibold leading-[1.02] tracking-[-0.05em]">
              Built for clarity-first product teams.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">

            {[
              {
                icon: <RiScan2Line size={24} />,
                title: "AI UX Detection",
                text: "Automatically identifies weak hierarchy, low trust and conversion friction.",
              },
              {
                icon: <RiFlashlightLine size={24} />,
                title: "Actionable Fixes",
                text: "Get concrete interface improvements instead of generic UX feedback.",
              },
              {
                icon: <RiLayout4Line size={24} />,
                title: "Copy Refinement",
                text: "Improve clarity and conversion messaging with AI-generated rewrites.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-[34px]
                  border
                  border-[rgba(6,28,47,0.05)]
                  bg-white
                  p-8
                  shadow-[0_12px_40px_rgba(0,0,0,0.03)]
                  transition-all
                  duration-300
                  hover:-translate-y-[3px]
                "
              >

                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#EEF8FF]
                    text-[#14A8E8]
                  "
                >
                  {item.icon}
                </div>

                <h3 className="mt-8 text-[24px] font-semibold tracking-[-0.03em]">
                  {item.title}
                </h3>

                <p className="mt-4 text-[16px] leading-8 text-[#667481]">
                  {item.text}
                </p>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section id="workflow" className="pb-24">

        <div className="mx-auto max-w-[1240px] px-8">

          <div
            className="
              relative
              overflow-hidden
              rounded-[40px]
              border
              border-[rgba(6,28,47,0.05)]
              bg-[#061C2F]
              px-10
              py-14
            "
          >

            <div
              className="
                absolute
                right-[-180px]
                top-[-120px]
                h-[480px]
                w-[480px]
                rounded-full
                bg-[radial-gradient(circle,rgba(20,168,232,0.22)_0%,transparent_72%)]
              "
            />

            <div className="relative z-10">

              <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#7FD7FF]">
                Workflow
              </p>

              <h2 className="mt-5 max-w-[680px] text-[48px] font-semibold leading-[1.02] tracking-[-0.05em] text-white">
                From screenshot to UX audit in minutes.
              </h2>

              <div className="mt-14 grid gap-6 md:grid-cols-3">

                {[
                  [
                    "01",
                    "Upload website",
                    "Paste a URL or upload screenshots of your interface.",
                  ],
                  [
                    "02",
                    "AI analyzes UX",
                    "Klynt detects hierarchy, clarity and conversion problems.",
                  ],
                  [
                    "03",
                    "Get improvements",
                    "Receive prioritized fixes and rewritten copy suggestions.",
                  ],
                ].map((item, index) => (
                  <div
                    key={index}
                    className="
                      rounded-[30px]
                      border
                      border-[rgba(255,255,255,0.08)]
                      bg-[rgba(255,255,255,0.04)]
                      p-7
                      backdrop-blur
                    "
                  >

                    <div className="flex items-center justify-between">

                      <div className="text-[42px] font-semibold tracking-[-0.05em] text-[#14A8E8]">
                        {item[0]}
                      </div>

                      <div
                        className="
                          flex
                          h-11
                          w-11
                          items-center
                          justify-center
                          rounded-2xl
                          bg-[rgba(20,168,232,0.16)]
                        "
                      >
                        <RiCheckLine size={18} className="text-[#7FD7FF]" />
                      </div>

                    </div>

                    <h3 className="mt-8 text-[24px] font-semibold text-white">
                      {item[1]}
                    </h3>

                    <p className="mt-4 text-[16px] leading-8 text-[#9EB3C3]">
                      {item[2]}
                    </p>

                  </div>
                ))}

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[rgba(6,28,47,0.05)] py-10">

        <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-6 px-8 md:flex-row">

          <div>
            <p className="text-[16px] font-semibold">
              Klynt
            </p>

            <p className="mt-2 text-[14px] text-[#7B8A97]">
              AI-powered UX clarity analysis for modern websites.
            </p>
          </div>

          <div className="flex items-center gap-6 text-[14px] text-[#71808D]">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>

        </div>
      </footer>

    </main>
  );
}