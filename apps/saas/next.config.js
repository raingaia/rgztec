/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // UI routes
      { source: "/app", destination: "/dashboard" },
      { source: "/app/:path*", destination: "/:path*" },

      // API routes (standard)
      { source: "/api/:path*", destination: "/api/:path*" },
    ];
  },
};

module.exports = nextConfig;
