/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', 
  distDir: 'public', // Çıktıyı doğrudan public klasöründen almasını söyleyelim
  images: { unoptimized: true }
};
export default nextConfig;
