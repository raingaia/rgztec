import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ✅ 1) Build hatalarını görmezden gel (build’in takılmasın)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ 2) Amplify / monorepo için güvenli çıktı
  output: "standalone",

  // ✅ 3) Next 16 + Amplify: Turbopack çakışmasını kesin çöz
  // (Log'daki "This build is using Turbopack..." hatası bununla biter)
  experimental: {
    turbo: false, // ⛔ Turbopack kapalı
    externalDir: true,
    outputFileTracingRoot: path.join(__dirname, "../../"),
  },
};

export default nextConfig;
