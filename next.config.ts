import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },

  // Критично: отключаем Edge полностью
  output: "standalone",
};

export default nextConfig;
