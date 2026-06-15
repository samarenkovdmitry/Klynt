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
    <div className="pt-0.5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold tracking-[-0.02em] text-[#111]">{title}</p>
          <p className="mt-1 flex items-center gap-2 text-[13px] text-[#999]">
            {loadingStalled ? (
              <RiLoader4Line
                size={14}
                className="shrink-0 animate-spin text-[#999]"
                aria-hidden
              />
            ) : null}
            <span>{loadingLabel}</span>
          </p>
        </div>
        <span className="shrink-0 pt-0.5 text-[12px] font-medium tabular-nums text-[#999]">
          {Math.floor(progress)}%
        </span>
      </div>

      <div className="mt-3.5 h-1 overflow-hidden rounded-full bg-black/[0.06]">
        <div
          className={[
            "h-full rounded-full bg-[#111] transition-all duration-500 ease-out",
            loadingStalled ? "animate-pulse" : "",
          ].join(" ")}
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={Math.floor(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={loadingLabel}
        />
      </div>

      {activeHelper ? (
        <p className="mt-2.5 text-[12px] leading-[1.5] text-[#C0C0BC]">{activeHelper}</p>
      ) : null}
    </div>
  );
}
