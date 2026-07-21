"use client";

import { useState } from "react";

type FaviconImgProps = {
  domain: string;
};

function extractHostname(input: string): string {
  try {
    const withProto = input.includes("://") ? input : `https://${input}`;
    return new URL(withProto).hostname.replace(/^www\./, "");
  } catch {
    return input.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}

export function FaviconImg({ domain }: FaviconImgProps) {
  const [failed, setFailed] = useState(false);
  const hostname = extractHostname(domain);
  const letter = hostname.charAt(0).toUpperCase();

  if (failed) {
    return (
      <span className="flex h-6 w-6 items-center justify-center font-mono text-[13px] font-semibold text-[#8C887D]">
        {letter}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=64`}
      alt=""
      width={24}
      height={24}
      className="h-6 w-6 object-contain"
      onError={() => setFailed(true)}
    />
  );
}
