import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ✅ Amplify/SSR için: STATIC EXPORT YOK
  // output: "export",          // ❌ kaldırıldı
  // trailingSlash: true,       // ❌ kaldırıldı

  images: {
    // Amplify SSR'de default optimizer çalışır.
    // Eğer S3 export'a dönersen tekrar true yaparsın.
    unoptimized: false,
  },

  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
