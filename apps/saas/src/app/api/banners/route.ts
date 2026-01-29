// apps/saas/app/api/banners/route.ts
export const runtime = "nodejs";

import { makeJsonCrudRoute } from "@common";   // ✅ alias kullanıldı

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "@data/banners/banners.json",                // ✅ alias kullanıldı
  {
    module: "banners",
    public: {
      allowQuery: true,
      activeOnly: true,
      queryFields: ["title", "name", "sponsor", "brand"],
      tagsField: "tags",
    },
    write: {
      requireAuth: true,
      roles: ["seller", "admin"],
      ownerKey: "store_key",
      allowStatusActiveForAdminOnly: true,
    },
  }
);

