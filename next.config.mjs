/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },

  // Отключает Edge, включает Node.js runtime
  output: "standalone",
};

export default nextConfig;
