/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
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

export default nextConfig;
