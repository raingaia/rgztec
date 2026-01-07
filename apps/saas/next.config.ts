import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    externalDir: true,
  },

  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@src": path.resolve(__dirname, "../../src"),
      "@app": path.resolve(__dirname, "./app"),
    };
    return config;
  },
};

export default nextConfig;


