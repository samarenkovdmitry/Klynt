import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Sign up",
  description: "Create a Klynt account to keep your project decisions on record.",
  path: "/register",
  index: false,
});

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
