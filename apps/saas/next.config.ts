import type { NextConfig } from "next";
import path from "path";

const projectRoot = __dirname; // /workspaces/rgztec/apps/saas

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ✅ monorepo’da root karışmasını engeller
  outputFileTracingRoot: projectRoot,

  experimental: {
    externalDir: true,
    // bazı projelerde gerekebiliyor
    // turbo: { root: projectRoot }, // Next 15'te config farklı olabilir, alttaki turbopack daha net
  },

  // ✅ Next 15 turbopack root fix (senin uyarının direkt çözümü)
  turbopack: {
    root: projectRoot,
  },

  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@src": path.resolve(projectRoot, "src"),
      "@app": path.resolve(projectRoot, "app"),
    };
    return config;
  },
};

export default nextConfig;
