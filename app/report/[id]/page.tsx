import { ReportPageView } from "@/components/report/ReportPageView";
import { getCachedReportRouteBundle } from "@/lib/report-server-cache";

type ReportPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;
  const { report } = await getCachedReportRouteBundle(id);

  return <ReportPageView routeParam={id} initialData={report} />;
}
