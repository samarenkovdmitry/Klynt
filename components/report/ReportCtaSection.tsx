import { RiArrowRightUpLine, RiDownload2Line } from "@remixicon/react";
import { Button } from "@/components/ui/Button";
import { BrandPill } from "@/components/ui/BrandPill";

type ReportCtaSectionProps = {
  onRerun: () => void;
  onExport: () => void;
};

export function ReportCtaSection({ onRerun, onExport }: ReportCtaSectionProps) {
  return (
    <section className="overflow-hidden rounded-[32px] border border-[rgba(6,28,47,0.05)] bg-white px-6 py-8 text-center shadow-[0_10px_40px_rgba(0,0,0,0.03)] md:px-10">
      <div className="mx-auto max-w-[760px]">
        <BrandPill className="text-[12px]">Next Step</BrandPill>

        <h3 className="mt-4 text-[30px] font-semibold leading-[1.05] tracking-[-0.04em] text-[var(--ink-primary)] md:text-[42px]">
          Improve your UX and run another analysis
        </h3>

        <p className="mt-4 text-[16px] leading-7 text-[var(--ink-secondary)]">
          Iterate on messaging, trust, hierarchy and conversion flow — then
          compare updated UX scores.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            onClick={onRerun}
            icon={<RiArrowRightUpLine size={18} />}
            fullWidth={false}
            className="w-full sm:w-auto"
          >
            Re-run analysis
          </Button>

          <Button
            onClick={onExport}
            variant="secondary"
            icon={<RiDownload2Line size={18} />}
            fullWidth={false}
            className="w-full sm:w-auto"
          >
            Export PDF
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[13px] text-neutral-500">
          <div className="rounded-full bg-[#F5F7FA] px-3 py-1">
            AI-generated insights
          </div>
          <div className="rounded-full bg-[#F5F7FA] px-3 py-1">
            Shareable report
          </div>
          <div className="rounded-full bg-[#F5F7FA] px-3 py-1">PDF export</div>
        </div>
      </div>
    </section>
  );
}
