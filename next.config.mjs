import { withSentryConfig } from "@sentry/nextjs/config";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The ru dev server (npm run dev:ru) needs its own build dir — sharing
  // .next with the en server mixes locale-baked chunks and breaks hydration.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async rewrites() {
    // Safari/iOS probes these icon paths without extensions; they
    // 404ed and noised up the logs.
    return [
      { source: "/apple-icon", destination: "/apple-icon.png" },
      { source: "/apple-touch-icon.png", destination: "/apple-icon.png" },
      { source: "/apple-touch-icon-precomposed.png", destination: "/apple-icon.png" },
    ];
  },

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
    instrumentationHook: true,
    serverActions: {
      allowedOrigins: ["*"],
    },
  },

  output: "standalone",

  webpack: (config) => {
    config.externals.push("@sparticuz/chromium");
    return config;
  },
};

export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  // Source maps upload requires SENTRY_AUTH_TOKEN — skip until configured
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
  telemetry: false,
});
