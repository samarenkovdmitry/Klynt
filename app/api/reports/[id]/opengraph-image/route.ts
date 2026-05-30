import { buildReportOpenGraphResponse } from "@/lib/report-opengraph-image";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    const params = await Promise.resolve(context.params);
    return await buildReportOpenGraphResponse(params.id);
  } catch (error) {
    console.error("[api report opengraph-image route]", error);
    return Response.json(
      { error: "Failed to generate Open Graph image" },
      { status: 500 }
    );
  }
}
