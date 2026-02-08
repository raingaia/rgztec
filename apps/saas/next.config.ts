import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Shared paketini (Prisma vb.) tanıması için bu satır şart
  transpilePackages: ["@repo/shared"],
  
  experimental: {
    // Monorepo içindeki klasör dışı dosyaları okuyabilmesi için
    externalDir: true,
  },
  
  // Varsa diğer ayarların...
};

export default nextConfig;