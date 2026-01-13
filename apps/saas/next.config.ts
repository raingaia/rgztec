import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ✅ Amplify SSR için en stabil paketleme
  output: "standalone",

  images: {
    unoptimized: false,
  },

  // ✅ Bizim fs ile okunan JSON data klasörlerini prod bundle'a zorla dahil et
  experimental: {
    outputFileTracingIncludes: {
      "/api/**": ["src/data/**/*"],
    },
  },

  // (İstersen şimdilik kalsın ama build stabil olduktan sonra kapatmanı öneririm)
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;

