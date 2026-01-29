// apps/saas/app/api/hardware/warehouses/route.ts
export const runtime = "nodejs";

import { makeJsonCrudRoute } from "@common";   // ✅ alias kullanıldı

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "@data/hardware/warehouses.json",            // ✅ alias kullanıldı
  {
    module: "hardware_warehouses",
    public: {
      publicReadable: false,
      allowQuery: true,
      queryFields: ["name", "city", "country"],
      tagsField: "tags",
    },
    write: {
      requireAuth: true,
      roles: ["admin"],
    },
  }
);

