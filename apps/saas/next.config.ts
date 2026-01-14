import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Amplify / prod için stabil
  output: "standalone",

  images: {
    unoptimized: false,
  },

  // ✅ ARTIK experimental DEĞİL
  outputFileTracingIncludes: {
    "/api/**": ["src/data/**/*"],
  },
};

export default nextConfig;

