"use client";

import { useEffect } from "react";

import { LANDING_DARK } from "@/components/landing-test/landingPageStyles";

const APP_CHROME = "#FFFFFF";

export function LandingBodyColor() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const themeMeta = document.querySelector(
      'meta[name="theme-color"]'
    ) as HTMLMetaElement | null;

    html.style.backgroundColor = LANDING_DARK;
    body.style.backgroundColor = LANDING_DARK;
    themeMeta?.setAttribute("content", LANDING_DARK);

    return () => {
      html.style.backgroundColor = "";
      body.style.backgroundColor = "";
      themeMeta?.setAttribute("content", APP_CHROME);
    };
  }, []);

  return null;
}
