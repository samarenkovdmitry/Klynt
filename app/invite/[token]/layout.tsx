import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "You're invited",
  description: "You've been invited to a project on Klynt — the project truth layer.",
  path: "/invite",
  index: false,
});

export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
