import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx"],
  // Turbopack ve Tracing ayarlarını koruyoruz
  turbopack: { root: __dirname },
  outputFileTracingRoot: __dirname,
  
  /* --- Milyar Dolarlık Bağlantı Buraya --- */
  experimental: {
    externalDir: true, // Bu satır, ../licensing klasörünü Next.js'e "içeriden biri" gibi tanıtır
  },
};

export default nextConfig;
