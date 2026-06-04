"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import { ReportPageStates } from "@/components/report/ReportPageStates";
import { ReportPrintDocument } from "@/components/report/print/ReportPrintDocument";
import { useReportData } from "@/hooks/useReportData";

function ReportPrintPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const reportId = Array.isArray(params.id) ? params.id[0] : params.id;
  const autoprint = searchParams.get("autoprint") === "1";

  const { data, loadState } = useReportData(reportId);

  useEffect(() => {
    if (!autoprint || loadState !== "ready" || !data) {
      return;
    }

    const timer = window.setTimeout(() => {
      window.print();
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [autoprint, loadState, data]);

  if (!reportId) {
    return <ReportPageStates loadState="missing" />;
  }

  if (loadState !== "ready" || !data) {
    return <ReportPageStates loadState={loadState} />;
  }

  return (
    <>
      <div className="report-print-toolbar no-print">
        <Link
          href={`/report/${reportId}`}
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

      <ReportPrintDocument data={data} reportId={reportId} />
    </>
  );
}

export default function ReportPrintPage() {
  return (
    <Suspense fallback={<ReportPageStates loadState="loading" />}>
      <ReportPrintPageContent />
    </Suspense>
  );
}
