"use client";

import { useEffect, useRef, useState } from "react";
import type { AuditReport } from "@/lib/audit-report";
import { isAuditReport } from "@/lib/audit-report";
import { toReportClientCachePayload } from "@/lib/report-api-payload";
import { loadReport, saveReport } from "@/lib/report-storage";

export type ReportLoadState = "loading" | "processing" | "ready" | "missing";

const REPORT_FETCH_TIMEOUT_MS = 15000;
const POLLING_INTERVAL_MS = 3000;

function parseStoredReport(
  stored: string,
  routeParam: string
): AuditReport | null {
  try {
    const parsed: unknown = JSON.parse(stored);

    if (!isAuditReport(parsed)) {
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

type FetchResult =
  | { kind: "ready"; report: AuditReport }
  | { kind: "processing" }
  | { kind: "missing" };

async function fetchReportFromApi(routeParam: string): Promise<FetchResult> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    REPORT_FETCH_TIMEOUT_MS
  );

  try {
    const res = await fetch(`/api/reports/${encodeURIComponent(routeParam)}`, {
      signal: controller.signal,
    });

    if (res.status === 202) {
      return { kind: "processing" };
    }

    if (!res.ok) {
      return { kind: "missing" };
    }

    const parsed: unknown = await res.json();

    if (!isAuditReport(parsed)) {
      return { kind: "missing" };
    }

    return {
      kind: "ready",
      report: toReportClientCachePayload(parsed, routeParam),
    };
  } catch {
    return { kind: "missing" };
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
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }

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

      const result = await fetchReportFromApi(id);

      if (cancelled) return;

      if (result.kind === "ready") {
        try {
          saveReport(id, result.report);
        } catch {
          // Cache optional
        }
        setData(result.report);
        setLoadState("ready");
        return;
      }

      if (result.kind === "processing") {
        setLoadState("processing");

        pollingRef.current = setInterval(async () => {
          if (cancelled) {
            stopPolling();
            return;
          }

          const polled = await fetchReportFromApi(id);

          if (cancelled) {
            stopPolling();
            return;
          }

          if (polled.kind === "ready") {
            stopPolling();
            try {
              saveReport(id, polled.report);
            } catch {
              // Cache optional
            }
            setData(polled.report);
            setLoadState("ready");
          } else if (polled.kind === "missing") {
            stopPolling();
            setLoadState("missing");
          }
        }, POLLING_INTERVAL_MS);

        return;
      }

      setLoadState("missing");
    }

    void load();

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [reportId]);

  return { data, loadState };
}
