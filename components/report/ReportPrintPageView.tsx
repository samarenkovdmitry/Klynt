"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ReportPageStates } from "@/components/report/ReportPageStates";
import { ReportPrintDocument } from "@/components/report/print/ReportPrintDocument";
import type { AuditReport } from "@/lib/audit-report";
import {
  buildPrintDocumentTitle,
  consumePrintAutoprint,
} from "@/lib/report-export";
import { formatReportDomain } from "@/lib/report-hero-theme";
import { resolveReportPreviewSrc } from "@/lib/report-preview-url";
import { useReportData } from "@/hooks/useReportData";

type ReportPrintPageViewProps = {
  routeParam: string;
  initialData?: AuditReport | null;
};

export function ReportPrintPageView({
  routeParam,
  initialData = null,
}: ReportPrintPageViewProps) {
  const [shouldAutoprint, setShouldAutoprint] = useState(false);
  const { data, loadState } = useReportData(routeParam, initialData);

  useEffect(() => {
    setShouldAutoprint(consumePrintAutoprint(routeParam));
  }, [routeParam]);

  useEffect(() => {
    if (loadState !== "ready" || !data) {
      return;
    }

    document.title = buildPrintDocumentTitle(formatReportDomain(data.url));
  }, [loadState, data]);

  useEffect(() => {
    if (!shouldAutoprint || loadState !== "ready" || !data) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.print();
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [shouldAutoprint, loadState, data]);

  if (!routeParam) {
    return <ReportPageStates loadState="missing" />;
  }

  if (loadState !== "ready" || !data) {
    return <ReportPageStates loadState={loadState} />;
  }

  const printData = {
    ...data,
    previewImage: resolveReportPreviewSrc(routeParam, data.previewImage),
  };

  return (
    <>
      <div className="report-print-toolbar no-print">
        <div className="report-print-toolbar-actions">
          <Link
            href={`/report/${routeParam}`}
            className="inline-flex h-10 items-center justify-center rounded-full border border-[rgba(6,28,47,0.1)] px-5 text-[14px] font-semibold text-[var(--ink-primary)] no-underline"
          >
            Back to report
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border-none bg-[#2563EB] px-5 text-[14px] font-semibold text-white"
          >
            Save as PDF
          </button>
        </div>
        <p className="report-print-toolbar-hint">
          In the print dialog, disable <strong>Headers and footers</strong> to hide the
          browser URL and page numbers. Your report already includes Klynt branding at the
          end.
        </p>
      </div>

      <ReportPrintDocument data={printData} reportId={routeParam} />
    </>
  );
}
