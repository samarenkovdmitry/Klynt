import { withSentryConfig } from "@sentry/nextjs/config";

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
