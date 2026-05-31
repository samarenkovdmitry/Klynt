/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },

  output: "standalone",

  outputFileTracingIncludes: {
    "/report/[id]/opengraph-image": [
      "./public/report/klynt-analyze-bg.svg",
      "./public/og-fallback.jpg",
    ],
    "/api/reports/[id]/opengraph-image": [
      "./public/report/klynt-analyze-bg.svg",
      "./public/og-fallback.jpg",
    ],
  },

  webpack: (config) => {
    config.externals.push("@sparticuz/chromium");
    return config;
  },
};

export default nextConfig;
