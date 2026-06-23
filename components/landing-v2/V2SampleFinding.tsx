import Link from "next/link";
import { RiArrowRightLine, RiErrorWarningFill, RiFileSearchLine } from "@remixicon/react";

import { DEMO_REPORT_PATH } from "@/lib/demo-report";

export function V2SampleFinding() {
  return (
    <section
      className="px-6 py-[96px] text-white md:px-[72px] md:py-[104px]"
      style={{ background: "radial-gradient(120% 120% at 18% 0%, #241F1A 0%, #16140F 60%)" }}
    >
      <div className="mx-auto max-w-[1080px]">
        <div className="mb-10 max-w-[680px]">
          <span className="mb-[18px] inline-flex items-center gap-2 font-mono text-[11.5px] tracking-[.1em] text-[#C9B79A]">
            <RiFileSearchLine size={14} aria-hidden />
            SAMPLE FINDING
          </span>
          <h2 className="mb-[14px] text-[42px] font-bold leading-[1.05] tracking-[-0.03em]">
            A real finding, from a real audit.
          </h2>
          <p className="max-w-[50ch] text-[18px] leading-[1.55] text-[#B6AFA2]">
            This is the actual output — one hero slot, measured and rewritten. No mockup.
          </p>
        </div>

        {/* Finding card */}
        <div className="max-w-[920px] rounded-[24px] border border-lv2-card-border bg-lv2-card px-[34px] pb-[28px] pt-[30px] text-v2-dark shadow-[0_40px_80px_-28px_rgba(0,0,0,.55)]">
          <div className="mb-[22px] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-[7px] rounded-full bg-lv2-amber-bg px-[11px] py-[6px] font-mono text-[10.5px] font-semibold tracking-[.06em] text-lv2-amber">
                <RiErrorWarningFill size={12} aria-hidden />
                ISSUE · CONTRAST
              </span>
              <span className="inline-flex items-center gap-[6px] font-mono text-[11px] text-v2-ink-faint">
                <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-v2-ink-faint" />
                linear.app · hero subhead
              </span>
            </div>
            <div className="font-sans text-[58px] font-bold leading-[.8] tracking-[-0.045em] text-v2-dark">
              2.8<span className="font-semibold text-[#6B6557]">:1</span>
            </div>
          </div>

          {/* Before / After */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="overflow-hidden rounded-[16px] border border-lv2-card-border">
              <div className="flex items-center justify-between border-b border-lv2-card-border bg-[#F4F0E7] px-4 py-[10px]">
                <span className="font-mono text-[10.5px] font-semibold tracking-[.07em] text-[#B0A99A]">BEFORE</span>
                <span className="font-mono text-[10.5px] font-semibold tracking-[.04em] text-lv2-amber">FAIL · 2.8:1</span>
              </div>
              <div className="bg-white px-5 py-[26px]">
                <p className="text-[21px] font-semibold leading-[1.25] tracking-[-0.01em] text-[#9CA3AF]">
                  Start your free trial today
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[16px] border border-lv2-card-border">
              <div className="flex items-center justify-between border-b border-[#DCEBDF] bg-[#EAF3EC] px-4 py-[10px]">
                <span className="font-mono text-[10.5px] font-semibold tracking-[.07em] text-lv2-green">AFTER</span>
                <span className="font-mono text-[10.5px] font-semibold tracking-[.04em] text-lv2-green">PASS · 7.1:1</span>
              </div>
              <div className="bg-white px-5 py-[26px]">
                <p className="text-[21px] font-semibold leading-[1.25] tracking-[-0.01em] text-[#1F2937]">
                  Start your free trial today
                </p>
              </div>
            </div>
          </div>

          {/* Color row */}
          <div className="mt-[18px] flex flex-wrap items-center gap-[10px] border-t border-[#EEEBE2] pt-[18px] text-[12px]">
            <span className="inline-flex items-center gap-[6px] font-mono text-[#9A9588] line-through decoration-[#CBC4B5]">
              <span className="h-[9px] w-[9px] shrink-0 rounded-full bg-[#9CA3AF]" />
              #9CA3AF
            </span>
            <RiArrowRightLine size={15} className="text-[#C8C1B1]" aria-hidden />
            <span className="inline-flex items-center gap-[6px] font-mono font-semibold text-v2-dark">
              <span className="h-[9px] w-[9px] shrink-0 rounded-full bg-[#1F2937]" />
              #1F2937 on #FFFFFF · passes AA
            </span>
          </div>
        </div>

        <Link
          href={DEMO_REPORT_PATH}
          className="mt-7 inline-flex h-[52px] items-center gap-[9px] rounded-[13px] border-2 border-white/25 px-[26px] text-[16px] font-semibold text-white transition-transform hover:-translate-y-px"
        >
          View full sample report
          <RiArrowRightLine size={18} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
