import { ReportPrintPageView } from "@/components/report/ReportPrintPageView";
import { getCachedReportRouteBundle } from "@/lib/report-server-cache";

type ReportPrintPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReportPrintPage({ params }: ReportPrintPageProps) {
  const { id } = await params;
  const { report } = await getCachedReportRouteBundle(id);

  return <ReportPrintPageView routeParam={id} initialData={report} />;
}
