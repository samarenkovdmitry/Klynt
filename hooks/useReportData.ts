"use client";

import { useEffect, useState } from "react";
import type { AuditReport } from "@/lib/audit-report";
import { isAuditReport } from "@/lib/audit-report";
import { loadReport } from "@/lib/report-storage";

export type ReportLoadState = "loading" | "ready" | "missing";

export function useReportData(reportId: string | undefined) {
  const [data, setData] = useState<AuditReport | null>(null);
  const [loadState, setLoadState] = useState<ReportLoadState>("loading");

  useEffect(() => {
    if (!reportId) return;

    const stored = loadReport(reportId);

    if (!stored) {
      setLoadState("missing");
      return;
    }

    try {
      const parsed: unknown = JSON.parse(stored);

      if (!isAuditReport(parsed)) {
        setLoadState("missing");
        return;
      }

      setData(parsed);
      setLoadState("ready");
    } catch {
      setLoadState("missing");
    }
  }, [reportId]);

  return { data, loadState };
}
