"use client";

import { useEffect } from "react";

const HERO_BG = "#53C2EE";

export function LandingBodyColor() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.backgroundColor;
    const prevBody = body.style.backgroundColor;

    html.style.backgroundColor = HERO_BG;
    body.style.backgroundColor = HERO_BG;

    return () => {
      html.style.backgroundColor = prevHtml;
      body.style.backgroundColor = prevBody;
    };
  }, []);

  return null;
}
