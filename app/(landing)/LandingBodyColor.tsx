"use client";

import { useEffect } from "react";

const APP_CHROME = "#FFFFFF";

export function LandingBodyColor() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const themeMeta = document.querySelector(
      'meta[name="theme-color"]'
    ) as HTMLMetaElement | null;

    html.style.backgroundColor = "transparent";
    body.style.backgroundColor = "transparent";
    themeMeta?.setAttribute("content", "transparent");

    return () => {
      html.style.backgroundColor = "";
      body.style.backgroundColor = "";
      themeMeta?.setAttribute("content", APP_CHROME);
    };
  }, []);

  return null;
}
