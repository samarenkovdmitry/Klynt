"use client";

import { useEffect, useState } from "react";
import type { AuditReport } from "@/lib/audit-report";
import { isAuditReport } from "@/lib/audit-report";
import { loadReport, saveReport } from "@/lib/report-storage";

export type ReportLoadState = "loading" | "ready" | "missing";

function parseStoredReport(stored: string): AuditReport | null {
  try {
    const parsed: unknown = JSON.parse(stored);

    if (!isAuditReport(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function useReportData(reportId: string | undefined) {
  const [data, setData] = useState<AuditReport | null>(null);
  const [loadState, setLoadState] = useState<ReportLoadState>("loading");

  useEffect(() => {
    if (!reportId) {
      setLoadState("missing");
      return;
    }

    const id = reportId;
    let cancelled = false;

    async function load() {
      setLoadState("loading");
      setData(null);

      const stored = loadReport(id);

      if (stored) {
        const parsed = parseStoredReport(stored);

        if (parsed) {
          if (!cancelled) {
            setData(parsed);
            setLoadState("ready");
          }

          return;
        }
      }

      try {
        const res = await fetch(`/api/reports/${id}`);

        if (!res.ok) {
          if (!cancelled) {
            setLoadState("missing");
          }

          return;
        }

        const parsed: unknown = await res.json();

        if (!isAuditReport(parsed)) {
          if (!cancelled) {
            setLoadState("missing");
          }

          return;
        }

        try {
          saveReport(id, parsed);
        } catch {
          // Cache optional — report still renders from API data
        }

        if (!cancelled) {
          setData(parsed);
          setLoadState("ready");
        }
      } catch {
        if (!cancelled) {
          setLoadState("missing");
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [reportId]);

  return { data, loadState };
}
