import type { Metadata } from "next";

import { buildPageMetadata } from "@/lib/seo";
import { getLocale } from "@/lib/market";

const ru = getLocale() === "ru";

export const metadata: Metadata = buildPageMetadata({
  title: ru ? "Политика конфиденциальности" : "Privacy Policy",
  description: ru
    ? "Как Klynt собирает и обрабатывает данные проектов из подключённых инструментов — Figma и Telegram."
    : "How Klynt collects and handles project data from connected tools like Figma, Slack and Linear.",
  path: "/privacy",
});

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
