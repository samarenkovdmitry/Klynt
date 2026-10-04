import type { Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Instrument_Sans, Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { rootMetadata } from "@/lib/seo";
import { getLocale } from "@/lib/market";

export const metadata = rootMetadata();

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#FFFFFF",
};

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: ["400", "500", "600", "700"],
});

// Inter ships Cyrillic — the RU deployment uses it since
// Instrument Sans is Latin-only and Cyrillic would fall back to system fonts.
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-instrument",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isRu = getLocale() === "ru";
  return (
    <html
      lang={getLocale()}
      className={`${isRu ? inter.variable + " " + inter.className : instrument.variable + " " + instrument.className} ${GeistMono.variable} antialiased bg-white`}
    >
      <body className="flex min-h-screen flex-col bg-white">
        <div className="flex flex-1 flex-col">{children}</div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
