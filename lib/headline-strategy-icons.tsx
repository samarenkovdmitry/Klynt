import type { RemixiconComponentType } from "@remixicon/react";
import {
  RiFocus3Line,
  RiFlashlightLine,
  RiLineChartLine,
  RiShieldCheckLine,
  RiSparkling2Line,
  RiTargetLine,
} from "@remixicon/react";

export function getHeadlineStrategyIcon(label: string): RemixiconComponentType {
  const normalized = label.toLowerCase();

  if (
    normalized.includes("bold") ||
    normalized.includes("brand-led") ||
    normalized.includes("emotional")
  ) {
    return RiSparkling2Line;
  }

  if (normalized.includes("outcome")) {
    return RiTargetLine;
  }

  if (
    normalized.includes("positioning") ||
    normalized.includes("angle") ||
    normalized.includes("contrarian")
  ) {
    return RiLineChartLine;
  }

  if (
    normalized.includes("authority") ||
    normalized.includes("proof") ||
    normalized.includes("credibility")
  ) {
    return RiShieldCheckLine;
  }

  if (normalized.includes("category") || normalized.includes("audience")) {
    return RiFocus3Line;
  }

  if (normalized.includes("problem") || normalized.includes("solution")) {
    return RiFlashlightLine;
  }

  if (normalized.includes("differentiat") || normalized.includes("niche")) {
    return RiLineChartLine;
  }

  return RiTargetLine;
}
