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

  if (!domain || failed) {
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
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`}
      alt=""
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
