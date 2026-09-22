import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Integrations",
  path: "/integrations",
  index: false,
});

export default function IntegrationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
