import type { ReactNode } from "react";
import { ImpactPercentageBadges } from "@/components/report/ImpactBadges";
import type { ImpactEntry } from "@/lib/report-impact";
import {
  REPORT_CARD_CLASS,
  REPORT_CARD_CLASS_ANIMATED,
  REPORT_CARD_HEADLINE_CLASS,
} from "@/components/report/reportStyles";
import { ReportIndexBadge } from "@/components/report/ReportIndexBadge";

type ReportListCardProps = {
  index: number;
  title: string;
  impactEntries: ImpactEntry[];
  animated?: boolean;
  children?: ReactNode;
};

export function ReportListCard({
  index,
  title,
  impactEntries,
  animated = false,
  children,
}: ReportListCardProps) {
  return (
    <div className={animated ? REPORT_CARD_CLASS_ANIMATED : REPORT_CARD_CLASS}>
      <div className="flex flex-col gap-5 md:flex-row md:gap-6">
        <div className="hidden items-start justify-center pt-0.5 md:flex">
          <ReportIndexBadge index={index} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-4 flex items-start justify-between gap-3 md:hidden">
                <ReportIndexBadge index={index} />
                <ImpactPercentageBadges
                  entries={impactEntries}
                  className="justify-end"
                />
              </div>

              <p className={REPORT_CARD_HEADLINE_CLASS}>{title}</p>

              <div className="hidden md:block lg:hidden">
                <ImpactPercentageBadges entries={impactEntries} className="mt-4" />
              </div>
            </div>

            <div className="hidden shrink-0 lg:block">
              <ImpactPercentageBadges entries={impactEntries} />
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
