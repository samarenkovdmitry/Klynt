"use client";

import { useEffect } from "react";

const HERO_BG = "#53C2EE";
const APP_CHROME = "#FFFFFF";

export function LandingBodyColor() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const themeMeta = document.querySelector(
      'meta[name="theme-color"]'
    ) as HTMLMetaElement | null;

    html.style.backgroundColor = HERO_BG;
    body.style.backgroundColor = HERO_BG;
    themeMeta?.setAttribute("content", HERO_BG);

    return () => {
      html.style.backgroundColor = "";
      body.style.backgroundColor = "";
      themeMeta?.setAttribute("content", APP_CHROME);
    };
  }, []);

  return null;
}
