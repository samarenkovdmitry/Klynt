import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },

    // КЛЮЧЕВОЕ: отключает Edge runtime
    // и заставляет App Router использовать Node.js
    serverMinification: false,
  },
};

export default nextConfig;
