import Link from "next/link";
import { RiArrowRightLine } from "@remixicon/react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#061C2F] overflow-hidden">

      {/* HERO */}
      <section className="relative">

        {/* TOP LIGHT */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-[radial-gradient(circle_at_top,#F7FBFF_0%,transparent_70%)]
          "
        />

        <div className="relative z-10 mx-auto max-w-[1180px] px-6 pt-24 pb-20">

          {/* NAVBAR */}
          <div className="flex items-center justify-between">

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
                  shadow-[0_10px_30px_rgba(20,168,232,0.22)]
                "
              >
                <span className="text-[18px] font-semibold tracking-[-0.04em]">
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
            <div className="hidden md:flex items-center gap-8 text-[14px] text-[#5E6A74]">
              <button className="hover:text-[#061C2F] transition">
                Product
              </button>

              <button className="hover:text-[#061C2F] transition">
                Examples
              </button>

              <button className="hover:text-[#061C2F] transition">
                Pricing
              </button>
            </div>
          </div>

          {/* HERO CONTENT */}
          <div className="mx-auto mt-24 max-w-[900px] text-center">

            {/* PILL */}
            <div
              className="
                mx-auto
                inline-flex
                items-center
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
              AI-powered UX review
            </div>

            {/* TITLE */}
            <h1
              className="
                mt-7
                text-[64px]
                leading-[0.95]
                tracking-[-0.06em]
                font-semibold
                text-[#061C2F]
              "
            >
              Find conversion friction
              <br />
              before your users do
            </h1>

            {/* DESCRIPTION */}
            <p
              className="
                mx-auto
                mt-7
                max-w-[760px]
                text-[20px]
                leading-9
                text-[#5E6A74]
              "
            >
              Klynt analyzes your website screenshots and turns them
              into prioritized UX issues, copy improvements, and
              conversion recommendations powered by AI.
            </p>

            {/* CTA */}
            <div className="mt-10 flex items-center justify-center gap-4">

              <Link
                href="/analyze"
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-[#14A8E8]
                  px-6
                  py-4
                  text-[15px]
                  font-semibold
                  text-white
                  transition-all
                  duration-200
                  hover:translate-y-[-1px]
                  hover:bg-[#1198D2]
                  hover:shadow-[0_12px_30px_rgba(20,168,232,0.24)]
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
                  px-6
                  py-4
                  text-[15px]
                  font-medium
                  text-[#061C2F]
                  transition-all
                  duration-200
                  hover:border-[rgba(20,168,232,0.16)]
                  hover:bg-[#F8FBFF]
                "
              >
                View sample report
              </button>

            </div>

            {/* TRUST ROW */}
            <div
              className="
                mt-14
                flex
                flex-wrap
                items-center
                justify-center
                gap-3
              "
            >

              {[
                "Full-page screenshot analysis",
                "Conversion-focused insights",
                "Prioritized UX issues",
                "AI copy refinement",
              ].map((item) => (
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

          {/* PREVIEW CARD */}
          <div className="mx-auto mt-20 max-w-[1040px]">

            <div
              className="
                relative
                overflow-hidden
                rounded-[36px]
                border
                border-[rgba(6,28,47,0.06)]
                bg-white
                p-6
                shadow-[0_30px_80px_rgba(0,0,0,0.06)]
              "
            >

              {/* FAKE REPORT HEADER */}
              <div className="flex items-center justify-between">

                <div>
                  <div className="h-4 w-32 rounded-full bg-neutral-200" />

                  <div className="mt-3 h-3 w-52 rounded-full bg-neutral-100" />
                </div>

                <div className="h-10 w-28 rounded-full bg-[#EEF7FD]" />
              </div>

              {/* CONTENT */}
              <div className="mt-8 grid grid-cols-3 gap-4">

                <div className="rounded-3xl bg-[#F8FAFC] p-5">
                  <div className="h-3 w-20 rounded-full bg-neutral-200" />

                  <div className="mt-5 h-16 w-16 rounded-full border-[6px] border-[#14A8E8]" />

                  <div className="mt-5 h-3 w-24 rounded-full bg-neutral-100" />
                </div>

                <div className="rounded-3xl bg-[#F8FAFC] p-5">
                  <div className="h-3 w-24 rounded-full bg-neutral-200" />

                  <div className="mt-5 h-8 w-32 rounded-xl bg-neutral-200" />

                  <div className="mt-5 h-3 w-20 rounded-full bg-neutral-100" />
                </div>

                <div className="rounded-3xl bg-[#F8FAFC] p-5">
                  <div className="h-3 w-28 rounded-full bg-neutral-200" />

                  <div className="mt-5 h-8 w-24 rounded-xl bg-[#E7F7EF]" />

                  <div className="mt-5 h-3 w-24 rounded-full bg-neutral-100" />
                </div>

              </div>

              {/* UX ISSUE */}
              <div className="mt-5 rounded-[28px] border border-neutral-100 p-6">

                <div className="flex items-start justify-between gap-6">

                  <div className="flex-1">

                    <div className="h-5 w-[70%] rounded-full bg-neutral-200" />

                    <div className="mt-4 flex gap-2">
                      <div className="h-8 w-24 rounded-full bg-neutral-100" />
                      <div className="h-8 w-20 rounded-full bg-neutral-100" />
                    </div>
                  </div>

                  <div className="h-10 w-24 rounded-full bg-[#FFF1E5]" />
                </div>

                <div className="mt-6 h-3 w-[92%] rounded-full bg-neutral-100" />
                <div className="mt-3 h-3 w-[82%] rounded-full bg-neutral-100" />

              </div>

            </div>

          </div>

        </div>
      </section>
    </main>
  );
}