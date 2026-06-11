"use client";

import { RiPaletteLine } from "@remixicon/react";
import type { ReportBreakdown, ReportChecklistItem } from "@/lib/audit-report";
import { REPORT_SECTION_SCROLL_MARGIN_CLASS, REPORT_SECTION_SPACING_CLASS } from "@/components/report/reportStyles";

type Props = {
  breakdown: ReportBreakdown;
  checklist?: ReportChecklistItem[];
};

const CONTRAST_ROWS: { element: string; ratio: string; pass: boolean; fix: string }[] = [
  { element: "Hero H1",    ratio: "3.2:1", pass: false, fix: "Darken text to #111" },
  { element: "CTA button", ratio: "4.6:1", pass: true,  fix: "—" },
  { element: "Body text",  ratio: "7.1:1", pass: true,  fix: "—" },
];

export function VisualFixes({ breakdown, checklist }: Props) {
  const showSubheadlineFix =
    checklist?.some((item) => item.id === "subheadline-clarity" && item.status === "weak") ?? false;

  const visuals = breakdown.visuals ?? 0;
  const h1Suggested = visuals >= 70 ? "40px (already good)" : "48px / 1.1";

  const typographyRows = [
    { role: "H1",      current: "40px / 1.2", suggested: h1Suggested },
    { role: "Subhead", current: "16px / 1.4", suggested: "18px / 1.5 / weight 500" },
    { role: "Body",    current: "15px",        suggested: "16px / max-width 640px" },
  ];

  return (
    <div
      id="visual-fixes"
      className={[REPORT_SECTION_SPACING_CLASS, REPORT_SECTION_SCROLL_MARGIN_CLASS].join(" ")}
    >
      <div className="overflow-hidden rounded-[16px] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.04),0_4px_20px_rgba(0,0,0,0.07)]">
        {/* Section header */}
        <div className="flex items-center justify-between px-5 pb-2.5 pt-3.5">
          <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.07em] text-[#999]">
            <RiPaletteLine size={14} aria-hidden />
            Visual fixes
          </span>
          <span className="rounded-full bg-[#EBF3FC] px-2 py-0.5 text-[11px] font-medium text-[#185FA5]">
            Phase 2
          </span>
        </div>

        {/* Content */}
        <div className="px-5 pb-4">
          {/* Critical fix row */}
          {showSubheadlineFix && (
            <div className="mb-3.5 flex items-start gap-2 rounded-[10px] bg-[#F5F5F3] px-[11px] py-[9px]">
              <span className="mt-px shrink-0 text-[13px] text-[#1D9E75]">→</span>
              <span className="text-[12px] leading-[1.65] text-[#555]">
                Increase subheadline to 18px weight 500 — currently reads as a caption, not a value proposition
              </span>
            </div>
          )}

          {/* Contrast table */}
          <div className="mb-3.5">
            <div className="mb-2 text-[12px] font-medium uppercase tracking-[0.06em] text-[#999]">
              Contrast (WCAG AA)
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Element", "Ratio", "Status", "Fix"].map((h) => (
                    <th
                      key={h}
                      className="border-b border-[rgba(0,0,0,0.07)] bg-[#F5F5F3] px-2.5 py-1.5 text-left text-[11px] font-medium text-[#C0C0BC]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CONTRAST_ROWS.map((row, i) => (
                  <tr
                    key={row.element}
                    className={i < CONTRAST_ROWS.length - 1 ? "[&>td]:border-b [&>td]:border-[rgba(0,0,0,0.07)]" : ""}
                  >
                    <td className="px-2.5 py-[9px] text-[13px] text-[#111]">{row.element}</td>
                    <td className="px-2.5 py-[9px] text-[13px] text-[#111]">{row.ratio}</td>
                    <td className="px-2.5 py-[9px]">
                      <span
                        className={[
                          "rounded-full px-2 py-0.5 text-[11px] font-medium",
                          row.pass
                            ? "bg-[#E8F7F2] text-[#0F6E56]"
                            : "bg-[#FDF0F0] text-[#8B2020]",
                        ].join(" ")}
                      >
                        {row.pass ? "Pass" : "Fail"}
                      </span>
                    </td>
                    <td className="px-2.5 py-[9px] text-[12px] text-[#999]">{row.fix}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Typography table */}
          <div>
            <div className="mb-2 text-[12px] font-medium uppercase tracking-[0.06em] text-[#999]">
              Typography
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Role", "Current", "Suggested"].map((h) => (
                    <th
                      key={h}
                      className="border-b border-[rgba(0,0,0,0.07)] bg-[#F5F5F3] px-2.5 py-1.5 text-left text-[11px] font-medium text-[#C0C0BC]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {typographyRows.map((row, i) => (
                  <tr
                    key={row.role}
                    className={i < typographyRows.length - 1 ? "[&>td]:border-b [&>td]:border-[rgba(0,0,0,0.07)]" : ""}
                  >
                    <td className="px-2.5 py-[9px] text-[13px] text-[#111]">{row.role}</td>
                    <td className="px-2.5 py-[9px] text-[13px] text-[#111]">{row.current}</td>
                    <td className="px-2.5 py-[9px] text-[12px] text-[#999]">{row.suggested}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
