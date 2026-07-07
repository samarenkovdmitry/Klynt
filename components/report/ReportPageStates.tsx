"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  RiArrowRightLine,
  RiLinkUnlink,
  RiLoader4Line,
} from "@remixicon/react";

import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/Button";
import type { ReportLoadState } from "@/hooks/useReportData";

const LOADING_UI_DELAY_MS = 300;

const REPORT_STATE_CARD_CLASS = [
  "w-full max-w-[480px] rounded-[32px] border border-[rgba(6,28,47,0.06)] bg-[#FAFBFC]",
  "shadow-[0_10px_40px_rgba(0,0,0,0.03)]",
].join(" ");

const REPORT_STATE_CTA_CLASS =
  "!h-[52px] !min-h-[52px] !rounded-full !px-7 !text-[15px] !font-semibold hover:!translate-y-0";

type ReportPageStatesProps = {
  loadState: ReportLoadState;
};

function ReportStateLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppHeader />
      <main className="flex min-h-[calc(100dvh-68px)] items-center justify-center bg-white px-4 md:px-6">
        {children}
      </main>
    </>
  );
}

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
      <ReportStateLayout>
        {showLoadingUi && (
          <div
            className={`${REPORT_STATE_CARD_CLASS} px-6 py-5 md:px-8 md:py-6`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center justify-center gap-3">
              <RiLoader4Line
                size={20}
                className="shrink-0 animate-spin text-[#2563EB]"
                aria-hidden
              />
              <p className="text-[15px] leading-5 text-[#8E99A2]">
                Loading report...
              </p>
            </div>
          </div>
        )}
      </ReportStateLayout>
    );
  }

  if (loadState === "missing") {
    return (
      <ReportStateLayout>
        <div
          className={`${REPORT_STATE_CARD_CLASS} px-6 py-8 text-center md:px-10 md:py-10`}
          role="alert"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(37,99,235,0.08)]">
            <RiLinkUnlink size={22} className="text-[#2563EB]" aria-hidden />
          </div>

          <p className="mt-5 text-[15px] font-normal leading-5 text-[#8E99A2]">
            Shared report
          </p>

          <h1 className="mt-2 text-[24px] font-bold leading-[1.15] tracking-[-0.02em] text-[var(--ink-primary)] md:text-[28px]">
            Report not available
          </h1>

          <p className="mt-3 text-[16px] leading-[25px] text-[rgba(6,28,47,0.5)]">
            This link may be invalid, or the report was created before sharing
            was enabled. Run a new analysis to generate a shareable report.
          </p>

          <div className="mt-8 flex justify-center">
            <Button
              href="/analyze"
              variant="accent"
              fullWidth={false}
              className={`${REPORT_STATE_CTA_CLASS} min-w-[200px]`}
              icon={<RiArrowRightLine size={18} aria-hidden />}
            >
              Run new analysis
            </Button>
          </div>
        </div>
      </ReportStateLayout>
    );
  }

  return null;
}
