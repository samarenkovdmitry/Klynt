import { isDemoReportRouteParam } from "@/lib/report-route";
import { isReportUnlocked } from "@/lib/reports-db";
import { getCachedReportRouteBundle } from "@/lib/report-server-cache";
import { ReportPageView } from "@/components/report/ReportPageView";

type ReportPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ unlocked?: string }>;
};

export default async function ReportPage({ params, searchParams }: ReportPageProps) {
  const { id } = await params;
  const { unlocked } = await searchParams;

  const { resolved, report } = await getCachedReportRouteBundle(id);
  const reportId = resolved?.reportId ?? null;

  const isDemo = isDemoReportRouteParam(id);
  const isUnlocked =
    isDemo || (reportId ? await isReportUnlocked(reportId) : false);

  return (
    <ReportPageView
      routeParam={id}
      initialData={report}
      reportId={reportId}
      isUnlocked={isUnlocked}
      showUnlockedBanner={unlocked === "true" && isUnlocked}
    />
  );
}
