const UI_FRAME =
  "overflow-hidden rounded-[12px] border border-white/[0.08] bg-[#0F141C] shadow-[0_8px_32px_rgba(0,0,0,0.18)]";

export function StepAddPageVisual() {
  return (
    <div className={UI_FRAME} aria-hidden>
      <div className="px-3.5 py-3">
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#2563EB]/80" />
          <span className="truncate text-[12px] text-white/45">https://your-landing-page.com</span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[11px] text-white/30">or upload screenshot</span>
          <span className="rounded-full bg-[#2563EB] px-3 py-1.5 text-[11px] font-medium text-white">
            Analyze UX
          </span>
        </div>
      </div>
    </div>
  );
}

export function StepAnalyzeVisual() {
  return (
    <div className={UI_FRAME} aria-hidden>
      <div className="px-3.5 py-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-white/40">Analyzing page</span>
          <span className="tabular-nums text-white/55">67%</span>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full w-[67%] rounded-full bg-[#2563EB]/80" />
        </div>
        <div className="mt-4 space-y-2.5">
          {[
            ["Hero clarity", "82%"],
            ["Trust signals", "71%"],
            ["Conversion flow", "58%"],
          ].map(([label, width]) => (
            <div key={label} className="flex items-center gap-2.5">
              <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-white/25"
                  style={{ width }}
                />
              </div>
              <span className="w-[72px] shrink-0 text-right text-[10px] text-white/35">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StepReportVisual() {
  return (
    <div className={UI_FRAME} aria-hidden>
      <div className="px-3.5 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 min-w-[28px] items-center justify-center rounded-full bg-[#FF7A00] px-1.5 text-[10px] font-bold text-white">
            6.5
          </span>
          <span className="text-[12px] font-medium text-white/70">Overall Assessment</span>
        </div>
        <ul className="mt-3 space-y-2 border-t border-white/[0.06] pt-3">
          {[
            "Hero headline lacks a clear first outcome",
            "Multiple CTAs compete above the fold",
          ].map((line) => (
            <li key={line} className="flex gap-2 text-[11px] leading-[15px] text-white/45">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/25" />
              <span className="line-clamp-2">{line}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 inline-flex rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] text-white/40">
          Copy refinement
        </div>
      </div>
    </div>
  );
}

export function CtaAnalyzeVisual() {
  return (
    <div
      className={`${UI_FRAME} mx-auto w-full max-w-[340px] lg:mx-0 lg:max-w-none`}
      aria-hidden
    >
      <div className="border-b border-white/[0.06] px-3.5 py-2.5">
        <p className="text-[11px] font-medium text-white/35">AI UX Review</p>
      </div>
      <div className="px-3.5 py-4">
        <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
          <span className="text-[12px] text-white/40">Paste URL or upload screenshot</span>
        </div>
        <div className="mt-3 flex gap-2">
          <span className="flex-1 rounded-full border border-white/[0.08] py-2 text-center text-[11px] text-white/35">
            Website URL
          </span>
          <span className="flex-1 rounded-full border border-white/[0.08] py-2 text-center text-[11px] text-white/35">
            Screenshot
          </span>
        </div>
        <div className="mt-4 flex justify-center">
          <span className="rounded-full bg-[#2563EB] px-5 py-2 text-[12px] font-medium text-white">
            Analyze UX
          </span>
        </div>
      </div>
    </div>
  );
}
