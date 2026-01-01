/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Optimized for cloud deployments
  experimental: {
    externalDir: true, // Crucial for monorepos if you share packages later
  },
}
module.exports = nextConfig
