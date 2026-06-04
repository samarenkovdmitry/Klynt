import type { ReactNode } from "react";
import {
  RiAlertLine,
  RiEdit2Line,
  RiLightbulbFlashLine,
} from "@remixicon/react";
import type { ReportSectionKind } from "@/lib/report-sections";
import { REPORT_SECTION_META } from "@/lib/report-sections";

const VARIANT_STYLES: Record<
  ReportSectionKind,
  { icon: typeof RiAlertLine; iconWrap: string; iconColor: string }
> = {
  issues: {
    icon: RiAlertLine,
    iconWrap: "bg-[#FFF7ED] border-[#FED7AA]",
    iconColor: "text-[#C2410C]",
  },
  improvements: {
    icon: RiLightbulbFlashLine,
    iconWrap: "bg-[#EFF6FF] border-[#BFDBFE]",
    iconColor: "text-[#2563EB]",
  },
  copy: {
    icon: RiEdit2Line,
    iconWrap: "bg-[#ECFDF5] border-[#A7F3D0]",
    iconColor: "text-[#059669]",
  },
};

type ReportSectionHeaderProps = {
  variant: ReportSectionKind;
  count: number;
  withTopRule?: boolean;
  title?: string;
  lead?: string;
  trailing?: ReactNode;
};

export function ReportSectionHeader({
  variant,
  count,
  withTopRule = false,
  title,
  lead,
  trailing,
}: ReportSectionHeaderProps) {
  const meta = REPORT_SECTION_META[variant];
  const styles = VARIANT_STYLES[variant];
  const Icon = styles.icon;
  const displayTitle = title ?? meta.title;
  const displayLead = lead ?? meta.lead;

  return (
    <div className={withTopRule ? "border-t border-[rgba(6,28,47,0.06)] pt-10" : ""}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3.5 md:gap-4">
          <div
            className={[
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border md:h-12 md:w-12",
              styles.iconWrap,
            ].join(" ")}
            aria-hidden
          >
            <Icon size={22} className={styles.iconColor} />
          </div>

          <div className="min-w-0">
            <h3 className="text-[22px] font-bold tracking-[-0.02em] text-[#061C2F] md:text-[24px]">
              {displayTitle}
              <span className="font-normal text-[#7D8C99]"> · {count}</span>
            </h3>
            <p className="mt-1.5 max-w-[560px] text-[14px] leading-[22px] text-[rgba(6,28,47,0.5)] md:text-[15px] md:leading-[23px]">
              {displayLead}
            </p>
          </div>
        </div>

        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>
    </div>
  );
}
