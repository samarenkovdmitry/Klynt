import { isDemoReportRouteParam } from "@/lib/report-route";
import { isReportUnlocked } from "@/lib/reports-db";
import { ReportPageView } from "@/components/report/ReportPageView";
import { getCachedReportRouteBundle } from "@/lib/report-server-cache";

type ReportPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ unlocked?: string; demo?: string }>;
};

export default async function ReportPage({ params, searchParams }: ReportPageProps) {
  const { id } = await params;
  const { unlocked, demo } = await searchParams;

  const { resolved, report } = await getCachedReportRouteBundle(id);
  const reportId = resolved?.reportId ?? null;

  const isDemo = isDemoReportRouteParam(id);
  const isUnlocked = isDemo || demo === "true" || (reportId ? await isReportUnlocked(reportId) : false);
  const showUnlockedBanner = unlocked === "true" && isUnlocked;

  return (
    <ReportPageView
      routeParam={id}
      initialData={report}
      isUnlocked={isUnlocked}
      showUnlockedBanner={showUnlockedBanner}
    />
  );
}
