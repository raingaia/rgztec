// apps/saas/app/api/products/admin/route.ts
export const runtime = "nodejs";

import { makeJsonCrudRoute } from "@common";   // ✅ alias kullanıldı

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "@data/products/products.json",              // ✅ alias kullanıldı
  {
    module: "products_admin",
    public: {
      publicReadable: false,
    },
    write: {
      requireAuth: true,
      roles: ["seller", "admin"],
      ownerKey: "store_key",
      allowStatusActiveForAdminOnly: true,
      writeMode: "file",
    },
  }
);
