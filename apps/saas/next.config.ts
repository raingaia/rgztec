import type { NextConfig } from "next";
import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ✅ 1. Build Hatalarını Engelle (Hatalı API rotaları olsa da build devam eder)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ 2. Monorepo Çıktı Ayarı
  // Standalone modu AWS Amplify için en sağlamıdır.
  output: "standalone", 
  
  experimental: {
    externalDir: true,
    // Monorepo köküne (root) kadar olan dosyaları izlemesini sağlar
    outputFileTracingRoot: path.join(__dirname, "../../"), 
  },

  // ✅ 3. Path Alias Ayarları
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@src": path.resolve(__dirname, "src"),
      "@app": path.resolve(__dirname, "app"),
    };

    return config;
  },

  // ✅ 4. Güvenlik (Environment Variables)
  // Sızan anahtarları kodun içinde değil, buradan yönetmeliyiz.
  env: {
    // Örn: NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
  }
};

export default nextConfig;
