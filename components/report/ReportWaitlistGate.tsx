"use client";

import { PreLaunchWaitlistCard } from "@/components/pre-launch/PreLaunchWaitlist";
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
    <section id="waitlist-gate" className="mt-6 scroll-mt-24 md:mt-8">
      <PreLaunchWaitlistCard reportId={reportId} locked={locked} onUnlock={onUnlock} />
    </section>
  );
}
