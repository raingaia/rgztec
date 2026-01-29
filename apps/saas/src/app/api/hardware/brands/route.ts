// apps/saas/app/api/hardware/brands/route.ts
export const runtime = "nodejs";

import { makeJsonCrudRoute } from "@common";   // ✅ alias kullanıldı

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "@data/hardware/brands.json",                // ✅ alias kullanıldı
  {
    module: "hardware_brands",
    public: {
      allowQuery: true,
      activeOnly: true,
      queryFields: ["name", "title"],
      tagsField: "tags",
    },
    write: {
      requireAuth: true,
      roles: ["admin", "seller"],
    },
  }
);

