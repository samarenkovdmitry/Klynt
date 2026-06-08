"use client";

import { useEffect, useState } from "react";
import type { AuditReport } from "@/lib/audit-report";
import {
  isReportComplete,
  isReportDisplayable,
} from "@/lib/audit-report";
import { toReportClientCachePayload } from "@/lib/report-api-payload";
import { loadReport, saveReport } from "@/lib/report-storage";

export type ReportLoadState = "loading" | "ready" | "missing";

const REPORT_FETCH_TIMEOUT_MS = 15000;
const REPORT_PARTIAL_POLL_MS = 2000;
const REPORT_PARTIAL_POLL_MAX_MS = 90_000;

function parseStoredReport(
  stored: string,
  routeParam: string
): AuditReport | null {
  try {
    const parsed: unknown = JSON.parse(stored);

    if (!isReportDisplayable(parsed)) {
      return null;
    }

    return toReportClientCachePayload(parsed, routeParam);
  } catch {
    return null;
  }
}

function readCachedReport(routeParam: string): AuditReport | null {
  const stored = loadReport(routeParam);

  if (!stored) {
    return null;
  }

  return parseStoredReport(stored, routeParam);
}

async function fetchReportFromApi(routeParam: string): Promise<AuditReport | null> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    REPORT_FETCH_TIMEOUT_MS
  );

  try {
    const res = await fetch(`/api/reports/${encodeURIComponent(routeParam)}`, {
      signal: controller.signal,
    });

    if (!res.ok) {
      return null;
    }

    const parsed: unknown = await res.json();

    if (!isReportDisplayable(parsed)) {
      return null;
    }

    return toReportClientCachePayload(parsed, routeParam);
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function getInitialLoadState(
  routeParam: string | undefined,
  initialData?: AuditReport | null
): ReportLoadState {
  if (!routeParam) {
    return "missing";
  }

  if (readCachedReport(routeParam) || initialData) {
    return "ready";
  }

  return "loading";
}

export function useReportData(
  reportId: string | undefined,
  initialData?: AuditReport | null
) {
  const [data, setData] = useState<AuditReport | null>(() => {
    if (!reportId) {
      return null;
    }

    return readCachedReport(reportId) ?? initialData ?? null;
  });
  const [loadState, setLoadState] = useState<ReportLoadState>(() =>
    getInitialLoadState(reportId, initialData)
  );

  useEffect(() => {
    if (!reportId) {
      setLoadState("missing");
      setData(null);
      return;
    }

    const id = reportId;
    let cancelled = false;

    async function load() {
      const cached = readCachedReport(id);

      if (cached) {
        if (!cancelled) {
          setData(cached);
          setLoadState("ready");
        }
        return;
      }

      if (initialData) {
        try {
          saveReport(id, toReportClientCachePayload(initialData, id));
        } catch {
          // Cache optional — SSR data still renders
        }

        if (!cancelled) {
          setData(initialData);
          setLoadState("ready");
        }
        return;
      }

      if (!cancelled) {
        setLoadState("loading");
        setData(null);
      }

      try {
        const parsed = await fetchReportFromApi(id);

        if (!parsed) {
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

  useEffect(() => {
    if (!reportId || !data || isReportComplete(data)) {
      return;
    }

    const id = reportId;
    let cancelled = false;
    const startedAt = Date.now();

    async function pollForCompleteReport() {
      const parsed = await fetchReportFromApi(id);

      if (cancelled || !parsed || !isReportComplete(parsed)) {
        return;
      }

      try {
        saveReport(id, parsed);
      } catch {
        // Render from memory even if cache write fails
      }

      setData(parsed);
    }

    void pollForCompleteReport();

    const timer = window.setInterval(() => {
      if (Date.now() - startedAt > REPORT_PARTIAL_POLL_MAX_MS) {
        window.clearInterval(timer);
        return;
      }

      void pollForCompleteReport();
    }, REPORT_PARTIAL_POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [reportId, data?.analysis_status]);

  return { data, loadState };
}
