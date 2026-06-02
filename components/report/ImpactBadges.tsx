import type { ReactNode } from "react";
import {
  RiFocus3Line,
  RiMoreLine,
  RiSparklingFill,
} from "@remixicon/react";

import type { ImpactEntry } from "@/lib/report-impact";
import {
  getPriorityLabel,
  ISSUE_IMPACT_BADGE_CLASS,
  PRIORITY_BADGE_CLASS,
  type PriorityItem,
  type PriorityLabel,
} from "@/lib/report-priority";

type ImpactBadgesProps = {
  entries: ImpactEntry[];
  className?: string;
};

type PriorityBadgeProps = {
  label?: ReturnType<typeof getPriorityLabel>;
  className?: string;
};

const IMPACT_PILL_CLASS =
  "inline-flex h-[37px] shrink-0 items-center rounded-full border px-[15px] text-[13px] font-semibold leading-[19.5px]";

function formatImpactMetric(key: string) {
  if (!key) return key;

  return key.charAt(0).toUpperCase() + key.slice(1);
}

function PriorityBadgeIcon({ label }: { label: PriorityLabel }) {
  if (label === "Quick Win") {
    return <RiSparklingFill size={12} className="text-[#D08700]" aria-hidden />;
  }

  if (label === "High Impact") {
    return <RiFocus3Line size={14} className="text-[#10B981]" aria-hidden />;
  }

  return <RiMoreLine size={14} className="text-[#616C77]" aria-hidden />;
}

function renderPriorityIcon(label: PriorityLabel): ReactNode {
  return <PriorityBadgeIcon label={label} />;
}

export function ImpactPercentageBadges({ entries, className = "" }: ImpactBadgesProps) {
  if (entries.length === 0) return null;

  const entry = entries[0];

  return (
    <div className={`flex max-w-full shrink-0 flex-wrap gap-2 md:justify-end ${className}`}>
      <div className={`${IMPACT_PILL_CLASS} ${ISSUE_IMPACT_BADGE_CLASS}`}>
        -{Math.abs(entry.value)}% {formatImpactMetric(entry.key)}
      </div>
    </div>
  );
}

export function PriorityBadge({ label, className = "" }: PriorityBadgeProps) {
  if (!label) return null;

  return (
    <div
      className={`${IMPACT_PILL_CLASS} gap-2 ${PRIORITY_BADGE_CLASS[label]} ${className}`}
    >
      {renderPriorityIcon(label)}
      {label}
    </div>
  );
}

export function PriorityBadgeFromImpact({
  item,
  className = "",
}: {
  item: PriorityItem;
  className?: string;
}) {
  return <PriorityBadge label={getPriorityLabel(item)} className={className} />;
}
