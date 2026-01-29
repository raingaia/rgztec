import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx"],
  turbopack: { root: __dirname },
  outputFileTracingRoot: __dirname
};

export default nextConfig;
