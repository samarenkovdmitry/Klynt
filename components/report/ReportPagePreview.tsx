import { REPORT_PREVIEW_HEIGHT, REPORT_PREVIEW_WIDTH } from "@/lib/report-preview-size";

type ReportPagePreviewProps = {
  domain?: string;
  previewImage?: string;
  topIssueTitle?: string;
  atmosphereColor?: string;
};

const GRID_LINE = "rgba(6,28,47,0.08)";

function PreviewFrameGrid() {
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[24px]"
      style={{
        backgroundImage: `linear-gradient(${GRID_LINE} 1px, transparent 1px), linear-gradient(90deg, ${GRID_LINE} 1px, transparent 1px)`,
        backgroundSize: "18px 18px",
      }}
      aria-hidden
    />
  );
}

function PreviewAtmosphere({ color }: { color: string }) {
  return (
    <div
      className="pointer-events-none absolute -inset-x-8 -inset-y-6"
      style={{
        background: `radial-gradient(ellipse 70% 65% at 55% 42%, ${color} 0%, transparent 72%)`,
      }}
      aria-hidden
    />
  );
}

export function ReportPagePreview({
  domain,
  previewImage,
  topIssueTitle,
  atmosphereColor = "rgba(246,228,212,0.55)",
}: ReportPagePreviewProps) {
  return (
    <div className="relative mx-auto w-[310px] px-3 pb-5 pt-3">
      {atmosphereColor && <PreviewAtmosphere color={atmosphereColor} />}
      <PreviewFrameGrid />

      <div className="relative z-[1] overflow-hidden rounded-lg border border-black/[0.08] bg-[#F8FAFC] shadow-[0_8px_28px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-1.5 border-b border-black/[0.06] bg-white px-2.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF5F57]" aria-hidden />
          <span className="h-1.5 w-1.5 rounded-full bg-[#FFBD2E]" aria-hidden />
          <span className="h-1.5 w-1.5 rounded-full bg-[#28CA41]" aria-hidden />
          {domain ? (
            <span className="ml-1 truncate text-[10px] text-[rgba(6,28,47,0.45)]">{domain}</span>
          ) : null}
        </div>

        {previewImage ? (
          <img
            src={previewImage}
            alt="Analyzed page preview"
            width={REPORT_PREVIEW_WIDTH}
            height={REPORT_PREVIEW_HEIGHT}
            className="block h-[190px] w-full object-cover object-top"
          />
        ) : (
          <div className="relative h-[190px] w-full overflow-hidden bg-gradient-to-b from-[#F8FAFC] to-[#EEF2F7]">
            <div className="absolute inset-x-4 top-4 space-y-2">
              <div className="h-2.5 w-2/3 rounded bg-[rgba(6,28,47,0.08)]" />
              <div className="h-2.5 w-1/2 rounded bg-[rgba(6,28,47,0.06)]" />
              <div className="mt-4 h-16 rounded-md bg-[rgba(6,28,47,0.04)]" />
            </div>
          </div>
        )}
      </div>

      {topIssueTitle && (
        <div className="absolute bottom-0 left-1/2 z-10 w-[calc(100%-28px)] -translate-x-1/2">
          <div className="rounded-full border border-[rgba(6,28,47,0.08)] bg-white px-3.5 py-2 shadow-[0_4px_20px_rgba(6,28,47,0.10)]">
            <p className="truncate text-[12px] leading-[17px] text-[var(--ink-primary)] md:text-[13px] md:leading-[18px]">
              <span className="font-medium text-[rgba(6,28,47,0.45)]">Top issue · </span>
              {topIssueTitle}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
