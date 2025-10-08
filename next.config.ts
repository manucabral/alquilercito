import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imgar.zonapropcdn.com",
      },
      {
        protocol: "https",
        hostname: "imgar.argenprop.com",
      },
    ],
  },
};

export default nextConfig;
