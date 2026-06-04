import type { ReactNode } from "react";
import {
  getReportCardClass,
  type ReportCardVariant,
} from "@/components/report/reportStyles";

const ACCENT_BAR_CLASS: Record<ReportCardVariant, string> = {
  issue: "bg-[rgba(245,158,11,0.5)]",
  improvement: "bg-[rgba(37,99,235,0.4)]",
  copy: "bg-[rgba(16,185,129,0.42)]",
};

type ReportVariantCardProps = {
  variant: ReportCardVariant;
  children: ReactNode;
};

export function ReportVariantCard({ variant, children }: ReportVariantCardProps) {
  return (
    <div className={`relative ${getReportCardClass(variant)}`}>
      <div
        className={[
          "pointer-events-none absolute top-6 bottom-6 left-[14px] w-[3px] rounded-full md:top-7 md:bottom-7 md:left-[22px]",
          ACCENT_BAR_CLASS[variant],
        ].join(" ")}
        aria-hidden
      />
      {children}
    </div>
  );
}
