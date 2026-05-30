import { NextResponse } from "next/server";

import {
  buildReportOpenGraphJpeg,
  REPORT_OG_IMAGE_HEADERS,
} from "@/lib/report-opengraph-image";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(_req: Request, context: RouteContext) {
  const params = await Promise.resolve(context.params);
  const image = await buildReportOpenGraphJpeg(params.id);

  return new NextResponse(new Uint8Array(image), {
    headers: REPORT_OG_IMAGE_HEADERS,
  });
}
