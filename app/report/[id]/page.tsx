import { ReportPageView } from "@/components/report/ReportPageView";
import { ReportPageV2 } from "@/components/report-v2/ReportPageV2";
import { getCachedReportRouteBundle } from "@/lib/report-server-cache";

type ReportPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ v2?: string }>;
};

export default async function ReportPage({ params, searchParams }: ReportPageProps) {
  const { id } = await params;
  const { v2 } = await searchParams;
  const { report } = await getCachedReportRouteBundle(id);

  if (v2 === "true") {
    return <ReportPageV2 routeParam={id} initialData={report} />;
  }

  return <ReportPageView routeParam={id} initialData={report} />;
}
