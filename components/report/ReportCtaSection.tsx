import { RiArrowRightUpLine, RiDownload2Line } from "@remixicon/react";

type ReportCtaSectionProps = {
  onRerun: () => void;
  onExport: () => void;
};

export function ReportCtaSection({ onRerun, onExport }: ReportCtaSectionProps) {
  return (
    <section className="overflow-hidden rounded-[32px] border border-[rgba(6,28,47,0.05)] bg-white px-[25px] py-[33px] text-center shadow-[0_10px_40px_rgba(0,0,0,0.03)] md:px-10 md:py-8">
      <div className="mx-auto max-w-[760px]">
        <p className="text-[15px] font-normal leading-5 text-[#8E99A2]">Next Step</p>

        <h3 className="mt-4 text-[30px] font-bold leading-[30px] tracking-[-0.01em] text-[var(--ink-primary)] md:text-[36px] md:leading-9">
          Improve your UX and run another analysis
        </h3>

        <p className="mt-4 text-[16px] leading-5 text-[rgba(6,28,47,0.5)] md:leading-[25px]">
          Iterate on messaging, trust, hierarchy and conversion flow — then
          compare updated UX scores.
        </p>

        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
          <button
            type="button"
            onClick={onRerun}
            className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full border border-transparent bg-[#2563EB] px-6 text-[15px] font-semibold text-white transition hover:bg-[#1D4ED8] sm:w-auto"
          >
            <RiArrowRightUpLine size={18} aria-hidden />
            Re-run analysis
          </button>

          <button
            type="button"
            onClick={onExport}
            className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full border border-[rgba(6,28,47,0.14)] bg-white px-6 text-[15px] font-semibold text-[var(--ink-primary)] transition hover:bg-[#F8FAFC] sm:w-auto"
          >
            <RiDownload2Line size={18} aria-hidden />
            Export PDF
          </button>
        </div>
      </div>
    </section>
  );
}
