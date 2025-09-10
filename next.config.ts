import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverSourceMaps: false,
    turbopackMemoryLimit: 3000, // 2 GB
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.mux.com",
      },
      {
        protocol: "https",
        hostname: "b3esub9h5p.ufs.sh",
      },
    ],
  },
};

export default nextConfig;
