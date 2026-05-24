import type { Viewport } from "next";
import { Familjen_Grotesk } from "next/font/google";
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
      <body className="min-h-screen flex flex-col bg-white">
        {children}
      </body>
    </html>
  );
}
