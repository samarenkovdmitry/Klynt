"use client";

import { useEffect, useState } from "react";
import { RiLoader4Line } from "@remixicon/react";

import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/Button";
import type { ReportLoadState } from "@/hooks/useReportData";

const LOADING_UI_DELAY_MS = 300;

type ReportPageStatesProps = {
  loadState: ReportLoadState;
};

export function ReportPageStates({ loadState }: ReportPageStatesProps) {
  const [showLoadingUi, setShowLoadingUi] = useState(false);

  useEffect(() => {
    if (loadState !== "loading") {
      setShowLoadingUi(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setShowLoadingUi(true);
    }, LOADING_UI_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadState]);

  if (loadState === "loading") {
    return (
      <>
        <AppHeader />
        <main className="flex min-h-[calc(100dvh-68px)] items-center justify-center bg-white px-6">
          {showLoadingUi && (
            <div
              className="rounded-3xl border border-neutral-200 bg-white px-8 py-6 shadow-sm"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-3">
                <RiLoader4Line
                  size={20}
                  className="shrink-0 animate-spin text-[#2563EB]"
                  aria-hidden
                />
                <p className="text-[15px] text-[var(--ink-secondary)]">
                  Loading report...
                </p>
              </div>
            </div>
          )}
        </main>
      </>
    );
  }

  if (loadState === "missing") {
    return (
      <>
        <AppHeader />
        <main className="flex min-h-[calc(100dvh-68px)] items-center justify-center bg-white px-6">
          <div className="max-w-[440px] rounded-3xl border border-neutral-200 bg-white px-8 py-8 text-center shadow-sm">
            <p className="text-[20px] font-semibold tracking-[-0.02em] text-[var(--ink-primary)]">
              Report not available
            </p>
            <p className="mt-3 text-[15px] leading-7 text-[var(--ink-secondary)]">
              This link may be invalid, or the report was created before sharing
              was enabled. Run a new analysis to generate a shareable report.
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
