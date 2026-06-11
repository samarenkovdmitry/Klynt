import {
  RiAlertFill,
  RiBarChartLine,
  RiCheckboxCircleFill,
  RiErrorWarningFill,
  RiListCheck3,
  RiPencilLine,
} from "@remixicon/react";

function PreviewBadge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "miss" | "weak" | "pass";
}) {
  const styles = {
    miss: "bg-[rgba(186,117,23,0.15)] text-[#E8A83A]",
    weak: "bg-[rgba(123,94,167,0.15)] text-[#B09FD4]",
    pass: "bg-[rgba(29,158,117,0.12)] text-[#2EC99A]",
  }[tone];

  return (
    <span className={`rounded-full px-[7px] py-[2px] text-[9px] font-medium ${styles}`}>
      {children}
    </span>
  );
}

function ChecklistRows({ compact = false }: { compact?: boolean }) {
  const rowClass = compact
    ? "flex items-center gap-1.5 border-b border-white/[0.05] py-[5px] text-[12px] last:border-b-0"
    : "flex items-center gap-1.5 border-b border-white/[0.04] py-1 text-[11px] last:border-b-0";

  return (
    <>
      <div className={rowClass}>
        <RiErrorWarningFill size={compact ? 13 : 12} className="shrink-0 text-[#E8A83A]" aria-hidden />
        <span className="flex-1 text-[#9A9A93]">Product category not named in headline</span>
        {!compact && <PreviewBadge tone="miss">Missing</PreviewBadge>}
        {compact && <PreviewBadge tone="miss">Missing</PreviewBadge>}
      </div>
      <div className={rowClass}>
        <RiErrorWarningFill size={compact ? 13 : 12} className="shrink-0 text-[#E8A83A]" aria-hidden />
        <span className="flex-1 text-[#9A9A93]">Trial terms unclear — free or demo?</span>
        {!compact && <PreviewBadge tone="miss">Missing</PreviewBadge>}
        {compact && <PreviewBadge tone="miss">Missing</PreviewBadge>}
      </div>
      {!compact && (
        <div className={rowClass}>
          <RiAlertFill size={12} className="shrink-0 text-[#B09FD4]" aria-hidden />
          <span className="flex-1 text-[#9A9A93]">Subheadline content weak</span>
          <PreviewBadge tone="weak">Weak</PreviewBadge>
        </div>
      )}
      <div className={rowClass}>
        <RiCheckboxCircleFill size={compact ? 13 : 12} className="shrink-0 text-[#2EC99A]" aria-hidden />
        <span className="flex-1 text-[#9A9A93]">Single primary CTA above fold</span>
        <PreviewBadge tone="pass">Pass</PreviewBadge>
      </div>
    </>
  );
}

export function LandingReportPreviewDesktop() {
  return (
    <div className="relative hidden lg:block">
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(29,158,117,0.12)_0%,transparent_65%)]"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#141412] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_32px_64px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#1C1C19] px-[14px] py-[11px]">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-[7px] bg-white/[0.06] px-2.5 py-[3px] text-[11px] font-medium text-[#9A9A93]">
              <span className="h-[5px] w-[5px] rounded-full bg-[#1D9E75]" aria-hidden />
              liance.dev
            </div>
            <span className="text-[11px] text-[#7A7A74]">June 2026</span>
          </div>
          <div className="flex gap-1">
            <span className="rounded-md border border-white/[0.08] bg-white/[0.05] px-2 py-[3px] text-[11px] text-[#7A7A74]">
              Share
            </span>
            <span className="rounded-md border border-white/[0.08] bg-white/[0.05] px-2 py-[3px] text-[11px] text-[#7A7A74]">
              PDF
            </span>
            <span className="rounded-md bg-[#F2F2EF] px-2 py-[3px] text-[11px] font-medium text-[#0E0E0C]">
              Re-run →
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-[14px] py-3">
          <div>
            <span className="font-sans text-[32px] font-bold leading-none tracking-[-0.04em] text-[#BA7517]">
              6.8
            </span>
            <span className="text-[11px] text-[#7A7A74]">/10</span>
          </div>
          <div className="h-[2px] min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[68%] rounded-full bg-[#BA7517]" />
          </div>
          <p className="min-w-0 flex-[2] font-sans text-[12px] font-medium leading-[1.4] text-[#F2F2EF]">
            Fear hook without product category or audience
          </p>
          <span className="shrink-0 rounded-full bg-[rgba(186,117,23,0.15)] px-2 py-[2px] text-[10px] font-medium text-[#E8A83A]">
            3 gaps
          </span>
        </div>

        <div className="border-b border-white/[0.08] px-[14px] py-2.5">
          <div className="mb-1.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.07em] text-[#7A7A74]">
            <RiListCheck3 size={12} aria-hidden />
            What needs fixing
          </div>
          <ChecklistRows />
        </div>

        <div className="border-b border-white/[0.08] px-[14px] py-2.5">
          <div className="mb-1.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.07em] text-[#7A7A74]">
            <RiPencilLine size={12} aria-hidden />
            Copy studio · Hero headline
          </div>
          <div className="mb-1 rounded-[7px] border border-[rgba(29,158,117,0.18)] bg-[rgba(29,158,117,0.08)] px-[9px] py-[7px]">
            <div className="mb-0.5 text-[9px] text-[#1D9E75]">Category + audience</div>
            <div className="text-[11px] font-medium leading-[1.4] text-[#F2F2EF]">
              SOC 2 compliance monitoring for engineering teams.
            </div>
          </div>
          <div className="mb-1 rounded-[7px] border border-white/[0.08] bg-white/[0.03] px-[9px] py-[7px]">
            <div className="mb-0.5 text-[9px] text-[#7A7A74]">Problem + solution</div>
            <div className="text-[11px] leading-[1.4] text-[#9A9A93]">
              Your SOC 2 is drifting. Liance catches it first.
            </div>
          </div>
          <div className="rounded-[7px] border border-white/[0.08] bg-white/[0.03] px-[9px] py-[7px]">
            <div className="mb-0.5 text-[9px] text-[#7A7A74]">Outcome + audience</div>
            <div className="text-[11px] leading-[1.4] text-[#9A9A93]">
              Pass your next audit — without last-minute scrambles.
            </div>
          </div>
        </div>

        <div className="px-[14px] py-2.5">
          <div className="mb-1.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.07em] text-[#7A7A74]">
            <RiBarChartLine size={12} aria-hidden />
            Score potential
          </div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="font-sans text-[20px] font-bold tracking-[-0.04em] text-[#BA7517]">6.8</span>
            <span className="text-[13px] text-[#7A7A74]">→</span>
            <span className="font-sans text-[20px] font-bold tracking-[-0.04em] text-[#1D9E75]">8.5</span>
            <span className="text-[11px] text-[#7A7A74]">after 3 fixes · estimate</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {[
              ["Product category missing", "+0.8"],
              ["Trial unclear", "+0.6"],
              ["Trust signal", "+0.4"],
            ].map(([label, delta]) => (
              <span
                key={label}
                className="rounded-[5px] border border-white/[0.08] bg-white/[0.05] px-[7px] py-[2px] text-[10px] text-[#9A9A93]"
              >
                {label} <strong className="font-medium text-[#1D9E75]">{delta}</strong>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingReportPreviewMobile() {
  return (
    <div className="mt-6 overflow-hidden rounded-[14px] border border-white/[0.08] bg-[#141412] lg:hidden">
      <div className="flex items-center gap-2.5 border-b border-white/[0.08] px-[14px] py-3">
        <div>
          <span className="font-sans text-[28px] font-bold leading-none tracking-[-0.04em] text-[#BA7517]">
            6.8
          </span>
          <span className="text-[11px] text-[#7A7A74]">/10</span>
        </div>
        <div className="h-[2px] min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[68%] rounded-full bg-[#BA7517]" />
        </div>
        <p className="min-w-0 flex-[2] font-sans text-[12px] font-medium leading-[1.4] text-[#F2F2EF]">
          Fear hook without product category
        </p>
        <span className="shrink-0 rounded-full bg-[rgba(186,117,23,0.15)] px-2 py-[2px] text-[10px] font-medium text-[#E8A83A]">
          3 gaps
        </span>
      </div>
      <div className="px-[14px] py-2.5">
        <ChecklistRows compact />
      </div>
    </div>
  );
}
