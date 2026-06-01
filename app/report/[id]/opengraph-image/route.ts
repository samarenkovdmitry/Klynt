import { buildReportOpenGraphResponse } from "@/lib/report-opengraph-image";
import { getRequestSiteUrl } from "@/lib/request-site-url";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    const params = await Promise.resolve(context.params);
    return await buildReportOpenGraphResponse(params.id, getRequestSiteUrl());
  } catch (error) {
    console.error("[report opengraph-image route]", error);
    return await buildReportOpenGraphResponse("invalid", getRequestSiteUrl());
  }
}
