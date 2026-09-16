import type { Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Instrument_Sans } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { rootMetadata } from "@/lib/seo";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${instrument.variable} ${instrument.className} ${GeistMono.variable} antialiased bg-white`}
    >
      <body className="flex min-h-screen flex-col bg-white">
        <div className="flex flex-1 flex-col">{children}</div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
