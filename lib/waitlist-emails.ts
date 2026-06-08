import { createServerSupabase } from "@/lib/supabase-server";
import { isValidReportId } from "@/lib/report-id";
import { getReportIdFromReportUrl } from "@/lib/report-route";

export { getReportIdFromReportUrl } from "@/lib/report-route";
export { isValidReportId } from "@/lib/report-id";

export async function saveWaitlistEmail(payload: {
  email: string;
  reportId: string;
}) {
  const supabase = createServerSupabase();

  const { error } = await supabase.from("waitlist_emails").insert({
    email: payload.email.trim().toLowerCase(),
    report_id: payload.reportId.trim(),
  });

  if (error) {
    throw new Error(error.message);
  }
}
