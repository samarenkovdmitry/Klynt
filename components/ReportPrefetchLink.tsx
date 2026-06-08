"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import { prefetchReportRoute } from "@/lib/report-prefetch";

type ReportPrefetchLinkProps = ComponentProps<typeof Link> & {
  routeParam: string;
};

export function ReportPrefetchLink({
  routeParam,
  onMouseEnter,
  onFocus,
  ...props
}: ReportPrefetchLinkProps) {
  function warmCache() {
    prefetchReportRoute(routeParam);
  }

  return (
    <Link
      {...props}
      onMouseEnter={(event) => {
        warmCache();
        onMouseEnter?.(event);
      }}
      onFocus={(event) => {
        warmCache();
        onFocus?.(event);
      }}
    />
  );
}
