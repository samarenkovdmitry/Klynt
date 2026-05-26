import {
  RiFilePdfLine,
  RiTimerFlashLine,
  RiUserSmileLine,
} from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";

export type TrustBadge = {
  icon: RemixiconComponentType;
  label: string;
};

export const TRUST_BADGES: TrustBadge[] = [
  { icon: RiUserSmileLine, label: "No signup required" },
  { icon: RiFilePdfLine, label: "PDF export" },
  { icon: RiTimerFlashLine, label: "AI-generated in ~15–25 sec" },
];
