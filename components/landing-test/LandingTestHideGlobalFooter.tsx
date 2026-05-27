"use client";

import { useEffect } from "react";

export function LandingTestHideGlobalFooter() {
  useEffect(() => {
    const footer = document.querySelector("body > footer");
    if (!footer) return;

    footer.setAttribute("hidden", "true");

    return () => {
      footer.removeAttribute("hidden");
    };
  }, []);

  return null;
}
