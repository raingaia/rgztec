// apps/saas/app/api/hardware/categories/route.ts
export const runtime = "nodejs";

import { makeJsonCrudRoute } from "@common";   // ✅ alias kullanıldı

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "@data/hardware/categories.json",            // ✅ alias kullanıldı
  {
    module: "hardware_categories",
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


