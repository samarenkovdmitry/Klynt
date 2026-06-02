"use client";

import { PreLaunchWaitlistCard } from "@/components/pre-launch/PreLaunchWaitlist";
import { REPORT_SECTION_SPACING_CLASS } from "@/components/report/reportStyles";
import type { ReportWaitlistLockedSummary } from "@/lib/pre-launch";

type ReportWaitlistGateProps = {
  reportId: string;
  locked: ReportWaitlistLockedSummary;
  onUnlock: () => void;
};

export function ReportWaitlistGate({
  reportId,
  locked,
  onUnlock,
}: ReportWaitlistGateProps) {
  return (
    <section className={REPORT_SECTION_SPACING_CLASS}>
      <PreLaunchWaitlistCard reportId={reportId} locked={locked} onUnlock={onUnlock} />
    </section>
  );
}
