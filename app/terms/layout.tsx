import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";
import { getLocale } from "@/lib/market";

const ru = getLocale() === "ru";

export const metadata: Metadata = buildPageMetadata({
  title: ru ? "Условия использования" : "Terms of Service",
  description: ru
    ? "Условия использования Klynt — слоя правды о проекте."
    : "Terms and conditions for using Klynt, the project truth layer.",
  path: "/terms",
});

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
