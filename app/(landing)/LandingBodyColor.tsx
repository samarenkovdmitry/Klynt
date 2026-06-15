"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const APP_CHROME = "#FFFFFF";
const LANDING_CHROME = "#0E0E0C";

export function LandingBodyColor() {
  const pathname = usePathname();
  const isLanding = pathname === "/" || pathname === "/contact";

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const themeMeta = document.querySelector(
      'meta[name="theme-color"]'
    ) as HTMLMetaElement | null;

    if (isLanding) {
      html.style.backgroundColor = LANDING_CHROME;
      body.style.backgroundColor = LANDING_CHROME;
      themeMeta?.setAttribute("content", LANDING_CHROME);
    } else {
      html.style.backgroundColor = "transparent";
      body.style.backgroundColor = "transparent";
      themeMeta?.setAttribute("content", "transparent");
    }

    return () => {
      html.style.backgroundColor = "";
      body.style.backgroundColor = "";
      themeMeta?.setAttribute("content", APP_CHROME);
    };
  }, [isLanding]);

  return null;
}
