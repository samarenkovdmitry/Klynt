import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Sign up",
  description: "Create a Klynt account — the truth layer for your projects.",
  path: "/register",
  index: false,
});

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
