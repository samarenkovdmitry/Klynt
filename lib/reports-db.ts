import type { AuditReport } from "@/lib/audit-report";
import { isAuditReport, isHeroAuditReport, isReportDisplayable } from "@/lib/audit-report";
import { DEMO_REPORT_ID } from "@/lib/demo-report";
import { isValidReportId } from "@/lib/report-id";
import { slugifyReportDomain } from "@/lib/report-slug";
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

  if (!isAuditReport(payload.report) && !isHeroAuditReport(payload.report)) {
    throw new Error("Invalid report payload");
  }

  const { error } = await supabase.from("reports").insert({
    id: payload.id,
    audited_url: payload.auditedUrl.trim(),
    payload: payload.report,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateReportOgPreviewInDb(
  reportId: string,
  ogPreviewImage: string
) {
  if (!isSupabaseConfigured() || !isValidReportId(reportId)) {
    return;
  }

  const existing = await loadReportFromDb(reportId);

  if (!existing) {
    return;
  }

  const supabase = createServerSupabase();

  const { error } = await supabase
    .from("reports")
    .update({
      payload: {
        ...existing,
        ogPreviewImage,
      },
    })
    .eq("id", reportId);

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

  if (!data?.payload || !isReportDisplayable(data.payload)) {
    return null;
  }

  return data.payload;
}

export async function updateReportInDb(reportId: string, report: AuditReport) {
  if (!isSupabaseConfigured() || !isValidReportId(reportId)) {
    return;
  }

  if (!isAuditReport(report) && !isHeroAuditReport(report)) {
    throw new Error("Invalid report payload");
  }

  const supabase = createServerSupabase();

  const { error } = await supabase
    .from("reports")
    .update({
      payload: report,
      audited_url: typeof report.url === "string" ? report.url.trim() : undefined,
    })
    .eq("id", reportId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function findReportIdBySlugInDb(
  idSuffix: string,
  domainSlug: string
): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("reports")
    .select("id, audited_url")
    .like("id", `${idSuffix}%`);

  if (error) {
    throw new Error(error.message);
  }

  const matches = (data ?? []).filter(
    (row) => slugifyReportDomain(row.audited_url) === domainSlug
  );

  if (matches.length === 0) {
    return null;
  }

  return matches[0].id;
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
