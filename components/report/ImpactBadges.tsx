import type { ReactNode } from "react";
import { RiSparklingFill } from "@remixicon/react";

import type { ImpactEntry } from "@/lib/report-impact";
import {
  getPriorityLabel,
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

function PriorityBadgeIcon({ label }: { label: PriorityLabel }) {
  if (label === "Quick Win") {
    return <RiSparklingFill size={12} className="text-[#D08700]" aria-hidden />;
  }

  if (label === "High Impact") {
    return (
      <span
        className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#009966]"
        aria-hidden
      />
    );
  }

  return (
    <span className="text-[12px] leading-none text-[#616C77]" aria-hidden>
      ◐
    </span>
  );
}

function renderPriorityIcon(label: PriorityLabel): ReactNode {
  return <PriorityBadgeIcon label={label} />;
}

export function ImpactPercentageBadges({ entries, className = "" }: ImpactBadgesProps) {
  if (entries.length === 0) return null;

  const entry = entries[0];

  return (
    <div className={`flex max-w-full shrink-0 flex-wrap gap-2 md:justify-end ${className}`}>
      <div
        className={`${IMPACT_PILL_CLASS} border-[#FFC9C9] bg-[#FEF2F2] text-[#FB2C36]`}
      >
        -{Math.abs(entry.value)}% {entry.key}
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
