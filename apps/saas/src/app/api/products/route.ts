// apps/saas/app/api/products/route.ts
export const runtime = "nodejs";

import { makeJsonCrudRoute } from "@common";   // ✅ alias kullanıldı

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "@data/products/products.json",              // ✅ alias kullanıldı
  {
    module: "products",
    idField: "id",
    public: {
      publicReadable: true,        // GET çalışsın
      activeOnly: true,            // public için sadece active
      allowQuery: true,
      queryFields: ["title", "slug", "category"],
      tagsField: "tags",
      requireStoreKey: false,
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

