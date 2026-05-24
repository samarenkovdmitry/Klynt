import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact",
  description:
    "Contact the Klynt team for questions, feedback, and partnership ideas. We read every message.",
  path: "/contact",
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
