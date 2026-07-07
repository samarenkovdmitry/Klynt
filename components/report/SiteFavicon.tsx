"use client";

import { useState } from "react";

type SiteFaviconProps = {
  domain?: string;
  size?: number;
  className?: string;
};

export function SiteFavicon({ domain, size = 64, className = "" }: SiteFaviconProps) {
  const [failed, setFailed] = useState(false);

  const cleanDomain = domain?.replace(/^www\./, "");
  const letter = cleanDomain ? cleanDomain[0].toUpperCase() : "?";

  const faviconSrc = `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=${size}`;
  console.log("[SiteFavicon]", { domain, cleanDomain, faviconSrc, failed });

  if (!cleanDomain || failed) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-[#E8EFFE] font-semibold text-[#2F6FED] ${className}`}
        style={{ fontSize: Math.round(size * 0.42) }}
      >
        {letter}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={faviconSrc}
      alt=""
      width={size}
      height={size}
      className={`object-contain ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
