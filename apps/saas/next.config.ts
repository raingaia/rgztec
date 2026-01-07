import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    externalDir: true
  },

  transpilePackages: ["src"]
};

export default nextConfig;

