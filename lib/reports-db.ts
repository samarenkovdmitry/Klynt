import type { AuditReport } from "@/lib/audit-report";
import { isAuditReport } from "@/lib/audit-report";
import type { ExtractionResult } from "@/lib/analysis/extraction";
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

  const { error } = await supabase.from("reports").insert({
    id: payload.id,
    audited_url: payload.auditedUrl.trim(),
    payload: payload.report,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function saveExtractionToDb(
  reportId: string,
  extraction: ExtractionResult
) {
  if (!isSupabaseConfigured() || !isValidReportId(reportId)) {
    return;
  }

  const supabase = createServerSupabase();

  const { error } = await supabase
    .from("reports")
    .update({ extraction, status: "processing" })
    .eq("id", reportId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateReportWithNarrativeInDb(
  reportId: string,
  report: AuditReport
) {
  if (!isSupabaseConfigured() || !isValidReportId(reportId)) {
    return;
  }

  const supabase = createServerSupabase();

  const { error } = await supabase
    .from("reports")
    .update({ payload: report, status: "ready" })
    .eq("id", reportId);

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
    .select("payload, status")
    .eq("id", reportId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;
  if (data.status === "processing") return null;
  if (!data.payload || !isAuditReport(data.payload)) return null;

  return data.payload;
}

export async function getReportStatusFromDb(
  reportId: string
): Promise<"processing" | "ready" | "missing"> {
  if (!isValidReportId(reportId) || !isSupabaseConfigured()) {
    return "missing";
  }

  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("reports")
    .select("status")
    .eq("id", reportId)
    .maybeSingle();

  if (error || !data) return "missing";
  if (data.status === "processing") return "processing";
  return "ready";
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

export async function fetchRecentGapGroups(limit = 10): Promise<string[][]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("reports")
    .select("payload")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data
    .map((row) => {
      const report = row.payload as AuditReport;
      return (report.checklist ?? [])
        .filter((item) => item.status !== "pass")
        .map((item) => item.text)
        .filter(Boolean);
    })
    .filter((gaps) => gaps.length > 0);
}

export async function isReportUnlocked(reportId: string): Promise<boolean> {
  if (!isValidReportId(reportId) || !isSupabaseConfigured()) {
    return false;
  }

  const supabase = createServerSupabase();

  const { data } = await supabase
    .from("reports")
    .select("unlocked_at")
    .eq("id", reportId)
    .maybeSingle();

  return !!data?.unlocked_at;
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
