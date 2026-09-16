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

  webpack: (config) => {
    config.externals.push("@sparticuz/chromium");
    return config;
  },
};

export default nextConfig;
