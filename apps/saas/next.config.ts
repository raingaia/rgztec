import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // 🔴 CloudFront + S3 için ŞART
  output: "export",
  trailingSlash: true,

  // 🔴 Next Image S3 uyumu
  images: {
    unoptimized: true,
  },

  // Monorepo güvenli
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
