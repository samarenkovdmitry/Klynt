/** Client-facing preview image URL (served by /api/reports/[id]/preview). */
export function buildReportPreviewPath(routeParam: string): string {
  const param = routeParam.trim();

  if (!param) {
    return "";
  }

  return `/api/reports/${encodeURIComponent(param)}/preview`;
}

/** Resolves preview src for UI — supports legacy cached data URLs and static paths. */
export function resolveReportPreviewSrc(
  routeParam: string,
  previewImage?: string
): string | undefined {
  if (!previewImage) {
    const path = buildReportPreviewPath(routeParam);
    return path || undefined;
  }

  if (
    previewImage.startsWith("data:") ||
    previewImage.startsWith("http://") ||
    previewImage.startsWith("https://") ||
    previewImage.startsWith("/demo/") ||
    previewImage.startsWith("/api/reports/")
  ) {
    return previewImage;
  }

  if (previewImage.startsWith("/")) {
    return previewImage;
  }

  return buildReportPreviewPath(routeParam);
}
