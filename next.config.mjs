/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.google.com",
        pathname: "/s2/favicons/**",
      },
    ],
  },

  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },

  output: "standalone",

  outputFileTracingIncludes: {
    "/report/[id]/opengraph-image": [
      "./public/og-fallback.jpg",
      "./public/klynt-logo-dark.svg",
      "./public/demo/zapier-preview.jpg",
      "./app/opengraph-image.jpg",
    ],
    "/api/reports/[id]/opengraph-image": [
      "./public/og-fallback.jpg",
      "./public/klynt-logo-dark.svg",
      "./public/demo/zapier-preview.jpg",
      "./app/opengraph-image.jpg",
    ],
  },

  webpack: (config) => {
    config.externals.push("@sparticuz/chromium");
    return config;
  },
};

export default nextConfig;
