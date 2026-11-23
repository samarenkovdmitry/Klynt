import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Log in",
  description: "Log in to Klynt to see what's agreed and what's changed in your projects.",
  path: "/login",
  index: false,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
