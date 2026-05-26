import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/Button";
import type { ReportLoadState } from "@/hooks/useReportData";

type ReportPageStatesProps = {
  loadState: ReportLoadState;
};

export function ReportPageStates({ loadState }: ReportPageStatesProps) {
  if (loadState === "loading") {
    return (
      <>
        <AppHeader />
        <main className="flex min-h-[calc(100dvh-68px)] items-center justify-center bg-[#F5F7FA] px-6">
          <div className="rounded-3xl border border-neutral-200 bg-white px-8 py-6 shadow-sm">
            <p className="text-[15px] text-[var(--ink-secondary)]">
              Loading report...
            </p>
          </div>
        </main>
      </>
    );
  }

  if (loadState === "missing") {
    return (
      <>
        <AppHeader />
        <main className="flex min-h-[calc(100dvh-68px)] items-center justify-center bg-[#F5F7FA] px-6">
          <div className="max-w-[440px] rounded-3xl border border-neutral-200 bg-white px-8 py-8 text-center shadow-sm">
            <p className="text-[20px] font-semibold tracking-[-0.02em] text-[var(--ink-primary)]">
              Report not available
            </p>
            <p className="mt-3 text-[15px] leading-7 text-[var(--ink-secondary)]">
              This report is stored only in the browser where the analysis was
              run. Open the link from the same device or run a new analysis.
            </p>
            <div className="mt-6">
              <Button href="/analyze" fullWidth={false} className="px-8">
                Run new analysis
              </Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return null;
}
