import type { AuditReport } from "@/lib/audit-report";
import { isAuditReport } from "@/lib/audit-report";
import { DEMO_REPORT_ID } from "@/lib/demo-report";
import { isValidReportId } from "@/lib/report-id";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase-server";

export async function saveReportToDb(payload: {
  id: string;
  auditedUrl: string;
  report: AuditReport;
}) {
  if (!isSupabaseConfigured()) {
    console.warn("[reports] Supabase not configured — report not persisted");
    return;
  }

  if (!isValidReportId(payload.id)) {
    throw new Error("Invalid report id");
  }

  const supabase = createServerSupabase();

  const { error } = await supabase.from("reports").insert({
    id: payload.id,
    audited_url: payload.auditedUrl.trim(),
    payload: payload.report,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function loadReportFromDb(
  reportId: string
): Promise<AuditReport | null> {
  if (!isValidReportId(reportId) || !isSupabaseConfigured()) {
    return null;
  }

  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("reports")
    .select("payload")
    .eq("id", reportId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.payload || !isAuditReport(data.payload)) {
    return null;
  }

  return data.payload;
}

export async function getAuditedPagesCount(): Promise<number | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createServerSupabase();

  const { count, error } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .neq("id", DEMO_REPORT_ID);

  if (error) {
    console.error("[reports] Failed to count audited pages:", error.message);
    return null;
  }

  return count ?? 0;
}
