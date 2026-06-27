import { isDemoReportRouteParam } from "@/lib/report-route";
import { isReportUnlocked } from "@/lib/reports-db";
import { ReportPageView } from "@/components/report/ReportPageView";
import { ReportPageV2 } from "@/components/report-v2/ReportPageV2";
import { getCachedReportRouteBundle } from "@/lib/report-server-cache";

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
  const isUnlocked = isDemo || (reportId ? await isReportUnlocked(reportId) : false);
  const showUnlockedBanner = unlocked === "true" && isUnlocked;
  console.log("[page] id:", id, "| reportId:", reportId, "| isDemo:", isDemo, "| isUnlocked:", isUnlocked);

  return <ReportPageV2 routeParam={id} initialData={report} isUnlocked={isUnlocked} reportId={reportId} />;

  // return (
  //   <ReportPageView
  //     routeParam={id}
  //     initialData={report}
  //     reportId={reportId}
  //     isUnlocked={isUnlocked}
  //     showUnlockedBanner={showUnlockedBanner}
  //   />
  // );
}
