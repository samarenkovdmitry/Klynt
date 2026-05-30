import { NextResponse } from "next/server";

import {
  buildReportOpenGraphJpeg,
  REPORT_OG_IMAGE_HEADERS,
} from "@/lib/report-opengraph-image";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    const params = await Promise.resolve(context.params);
    const image = await buildReportOpenGraphJpeg(params.id);

    return new NextResponse(new Uint8Array(image), {
      headers: REPORT_OG_IMAGE_HEADERS,
    });
  } catch (error) {
    console.error("[api report opengraph-image route]", error);
    return NextResponse.json(
      { error: "Failed to generate Open Graph image" },
      { status: 500 }
    );
  }
}
