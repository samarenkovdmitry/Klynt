import type { ReactNode } from "react";
import { ImpactPercentageBadges } from "@/components/report/ImpactBadges";
import type { ImpactEntry } from "@/lib/report-impact";
import {
  REPORT_CARD_CLASS,
  REPORT_CARD_HEADLINE_CLASS,
} from "@/components/report/reportStyles";
import { ReportIndexBadge } from "@/components/report/ReportIndexBadge";

type ReportListCardProps = {
  index: number;
  title: string;
  impactEntries: ImpactEntry[];
  cardClassName?: string;
  children?: ReactNode;
};

export function ReportListCard({
  index,
  title,
  impactEntries,
  cardClassName = REPORT_CARD_CLASS,
  children,
}: ReportListCardProps) {
  return (
    <div className={cardClassName}>
      <div className="flex flex-col gap-5 md:flex-row md:gap-6">
        <div className="hidden items-start justify-center pt-0.5 md:flex">
          <ReportIndexBadge index={index} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-4 flex items-start justify-between gap-3 md:hidden">
                <ReportIndexBadge index={index} />
                <ImpactPercentageBadges
                  entries={impactEntries}
                  className="ml-auto shrink-0 justify-end"
                />
              </div>

              <p className={REPORT_CARD_HEADLINE_CLASS}>{title}</p>
            </div>

            <div className="hidden shrink-0 md:block">
              <ImpactPercentageBadges entries={impactEntries} />
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
