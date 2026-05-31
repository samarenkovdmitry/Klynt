import type { ImpactEntry } from "@/lib/report-impact";
import {
  getPriorityLabel,
  PRIORITY_BADGE_CLASS,
  PRIORITY_BADGE_ICON,
  type PriorityLabel,
} from "@/lib/report-priority";

type ImpactBadgesProps = {
  entries: ImpactEntry[];
  className?: string;
};

type PriorityBadgeProps = {
  label?: PriorityLabel;
  className?: string;
};

const IMPACT_PILL_CLASS =
  "inline-flex h-[37px] shrink-0 items-center rounded-full border px-[15px] text-[13px] font-semibold leading-[19.5px]";

export function ImpactPercentageBadges({ entries, className = "" }: ImpactBadgesProps) {
  if (entries.length === 0) return null;

  return (
    <div className={`flex max-w-full flex-wrap gap-2 lg:justify-end ${className}`}>
      {entries.map((entry, i) => (
        <div
          key={i}
          className={`${IMPACT_PILL_CLASS} border-[#FFC9C9] bg-[#FEF2F2] text-[#FB2C36]`}
        >
          -{Math.abs(entry.value)}% {entry.key}
        </div>
      ))}
    </div>
  );
}

export function PriorityBadge({ label, className = "" }: PriorityBadgeProps) {
  if (!label) return null;

  const icon = PRIORITY_BADGE_ICON[label];

  return (
    <div
      className={`${IMPACT_PILL_CLASS} ${PRIORITY_BADGE_CLASS[label]} ${className}`}
    >
      {icon ? <span className="mr-1.5">{icon}</span> : null}
      {label}
    </div>
  );
}

export function PriorityBadgeFromImpact({
  item,
  className = "",
}: {
  item: Parameters<typeof getPriorityLabel>[0];
  className?: string;
}) {
  return <PriorityBadge label={getPriorityLabel(item)} className={className} />;
}
