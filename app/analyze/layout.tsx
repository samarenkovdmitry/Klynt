import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Analyze UX",
  description:
    "Run a free AI UX review on your landing page. Paste a URL or upload a screenshot to get clarity, trust, and conversion insights.",
  path: "/analyze",
  index: false,
});

export default function AnalyzeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex min-h-0 flex-1 flex-col bg-white">{children}</div>;
}
