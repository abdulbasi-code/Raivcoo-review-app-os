/** @type {import('next').NextConfig} */
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  experimental: {
    useCache: true,
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
        port: "",
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: "*",
        port: "",
        pathname: "**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

module.exports = nextConfig;
