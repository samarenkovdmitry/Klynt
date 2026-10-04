import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Projects",
  path: "/project",
  index: false,
});

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return children;
}
