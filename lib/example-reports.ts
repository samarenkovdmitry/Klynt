import type { AuditReport } from "@/lib/audit-report";
import { DEMO_REPORT_ID } from "@/lib/demo-report";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase-server";

export type ExampleReport = {
  id: string;
  audited_url: string;
  payload: AuditReport;
};

const PINNED_REPORT_IDS = [
  "vq6y9fn9d3", // wise.com
  "b34b0vvafv", // figma.com
  "quvekkudcw", // loom.com
  "ho2808rdzu", // notion.so
  "3fx8oz0nh2", // cal.com
  "1vmtrfrwgm", // linear.app
];

export async function fetchExampleReports(_limit?: number): Promise<ExampleReport[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("reports")
    .select("id, audited_url, payload, created_at")
    .in("id", PINNED_REPORT_IDS);

  if (error || !data) return [];

  const valid = data.filter(
    (row) =>
      row.payload &&
      typeof (row.payload as AuditReport).score === "number" &&
      row.audited_url
  ) as ExampleReport[];

  // preserve the pinned order
  return PINNED_REPORT_IDS.flatMap((id) => valid.filter((r) => r.id === id));
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function getTopFinding(payload: AuditReport): string | null {
  const topChecklist = (payload.checklist ?? []).find(
    (item) => item.status !== "pass"
  );
  if (topChecklist?.text) return topChecklist.text;
  if (payload.issues?.[0]?.title) return payload.issues[0].title;
  if (payload.key_observation) return payload.key_observation;
  return null;
}

const CATEGORY_LABEL: Record<string, string> = {
  copy: "COPY",
  trust: "TRUST",
  visual: "VISUALS",
  structure: "STRUCTURE",
};

export function getTopFindingCategory(payload: AuditReport): string {
  const topChecklist = (payload.checklist ?? []).find(
    (item) => item.status !== "pass"
  );
  if (topChecklist?.category) {
    return CATEGORY_LABEL[topChecklist.category] ?? topChecklist.category.toUpperCase();
  }
  const issueCategory = payload.issues?.[0]?.category;
  if (issueCategory) {
    return String(issueCategory).toUpperCase();
  }
  return "FINDING";
}
