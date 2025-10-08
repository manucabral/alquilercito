import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "imgar.zonapropcdn.com" },
      { protocol: "https", hostname: "imgar.argenprop.com" },
      { protocol: "https", hostname: "www.argenprop.com" },
      { protocol: "https", hostname: "argenprop.com" },
    ],
  },
};

export default nextConfig;
