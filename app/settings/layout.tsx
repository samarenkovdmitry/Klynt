import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Settings",
  path: "/settings",
  index: false,
});

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
