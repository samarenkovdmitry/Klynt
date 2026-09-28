import type { Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Instrument_Sans } from "next/font/google";
import { GeistSans } from "geist/font/sans";
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

// Geist Sans ships Cyrillic — the RU deployment uses it since
// Instrument Sans is Latin-only and Cyrillic would fall back to system fonts.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isRu = getLocale() === "ru";
  return (
    <html
      lang={getLocale()}
      className={`${isRu ? GeistSans.variable : instrument.variable + " " + instrument.className} ${GeistMono.variable} antialiased bg-white`}
      // Geist defines --font-geist-sans; the app's font stack reads
      // --font-instrument, so alias it on the ru deployment.
      style={isRu ? ({ "--font-instrument": "var(--font-geist-sans)" } as React.CSSProperties) : undefined}
    >
      <body className="flex min-h-screen flex-col bg-white">
        <div className="flex flex-1 flex-col">{children}</div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
