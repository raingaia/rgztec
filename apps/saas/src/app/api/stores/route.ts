// apps/saas/app/api/stores/route.ts
export const runtime = "nodejs";

import { makeJsonCrudRoute } from "@common";   // ✅ alias kullanıldı

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "@data/stores/stores.json",                  // ✅ alias kullanıldı
  {
    module: "stores",
    public: {
      allowQuery: true,
      activeOnly: true,
      queryFields: ["name", "title", "slug"],
      tagsField: "tags",
    },
    write: {
      requireAuth: true,
      roles: ["admin"],
    },
  }
);



