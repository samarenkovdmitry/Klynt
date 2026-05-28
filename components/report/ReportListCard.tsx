import type { ReactNode } from "react";
import { ImpactBadges, type ImpactBadgeVariant } from "@/components/report/ImpactBadges";
import type { ImpactEntry } from "@/lib/report-impact";
import {
  REPORT_CARD_CLASS,
  REPORT_CARD_CLASS_ANIMATED,
  REPORT_ITEM_TITLE_CLASS,
} from "@/components/report/reportStyles";

function IndexBadge({ index }: { index: number }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(6,28,47,0.08)] bg-[#F5F7FA] text-[15px] font-semibold text-neutral-400">
      {index + 1}
    </div>
  );
}

type ReportListCardProps = {
  index: number;
  title: string;
  impactEntries: ImpactEntry[];
  impactVariant: ImpactBadgeVariant;
  animated?: boolean;
  children?: ReactNode;
};

export function ReportListCard({
  index,
  title,
  impactEntries,
  impactVariant,
  animated = false,
  children,
}: ReportListCardProps) {
  return (
    <div className={animated ? REPORT_CARD_CLASS_ANIMATED : REPORT_CARD_CLASS}>
      <div className="flex flex-col gap-5 md:flex-row md:gap-6">
        <div className="hidden items-start justify-center pt-0.5 md:flex">
          <IndexBadge index={index} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex items-start justify-between gap-3 md:hidden">
                <IndexBadge index={index} />
                <ImpactBadges
                  entries={impactEntries}
                  variant={impactVariant}
                  className="justify-end"
                />
              </div>

              <p className={REPORT_ITEM_TITLE_CLASS}>{title}</p>

              <div className="hidden md:block lg:hidden">
                <ImpactBadges
                  entries={impactEntries}
                  variant={impactVariant}
                  className="mt-3"
                />
              </div>
            </div>

            <div className="hidden shrink-0 lg:block">
              <ImpactBadges entries={impactEntries} variant={impactVariant} />
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
