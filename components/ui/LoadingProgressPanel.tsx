import { RiLoader4Line } from "@remixicon/react";

type LoadingProgressPanelProps = {
  title: string;
  loadingLabel: string;
  progress: number;
  loadingStalled?: boolean;
  helperText?: string;
  stallHelperText?: string;
};

export function LoadingProgressPanel({
  title,
  loadingLabel,
  progress,
  loadingStalled = false,
  helperText,
  stallHelperText,
}: LoadingProgressPanelProps) {
  const activeHelper = loadingStalled && stallHelperText ? stallHelperText : helperText;

  return (
    <div className="pt-1">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--ink-primary)]">
            {title}
          </p>
          <p className="mt-0.5 flex items-center gap-2 text-[14px] text-[rgba(6,28,47,0.5)]">
            {loadingStalled && (
              <RiLoader4Line
                size={15}
                className="shrink-0 animate-spin text-[#2563EB]"
                aria-hidden
              />
            )}
            <span>{loadingLabel}</span>
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-[rgba(6,28,47,0.10)] bg-white px-3 py-1.5 text-[13px] font-semibold tabular-nums text-[#2563EB]">
          {Math.floor(progress)}%
        </span>
      </div>

      <div className="mt-4 h-[6px] overflow-hidden rounded-full bg-[#E5E7EB]">
        <div
          className={[
            "h-full rounded-full bg-[#2563EB] transition-all duration-500 ease-out",
            loadingStalled ? "animate-pulse" : "",
          ].join(" ")}
          style={{ width: `${progress}%` }}
        />
      </div>

      {activeHelper ? (
        <p className="mt-3 text-[13px] text-[rgba(6,28,47,0.5)]">{activeHelper}</p>
      ) : null}
    </div>
  );
}
