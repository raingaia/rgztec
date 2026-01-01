/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: "/app", destination: "/dashboard" },
      { source: "/app/:path*", destination: "/:path*" }
    ];
  }
};

module.exports = nextConfig;

