import type { Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Familjen_Grotesk } from "next/font/google";
import { AppFooter } from "@/components/AppFooter";
import "./globals.css";
import { rootMetadata } from "@/lib/seo";

export const metadata = rootMetadata();

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#FFFFFF",
};

const familjen = Familjen_Grotesk({
  subsets: ["latin"],
  variable: "--font-familjen",
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
      className={`${familjen.variable} antialiased bg-white`}
    >
      <body className="flex min-h-screen flex-col bg-white">
        <div className="flex flex-1 flex-col">{children}</div>
        <AppFooter />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
