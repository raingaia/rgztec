// apps/saas/app/api/_pricing/route.ts
export const runtime = "nodejs";

import { makeJsonCrudRoute } from "@common";   // ✅ alias kullanıldı

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "@data/pricing/plans.json",                  // ✅ alias kullanıldı
  {
    module: "pricing",
    public: {
      allowQuery: true,
      activeOnly: true,
      queryFields: ["name", "title", "plan"],
      tagsField: "tags",
    },
    write: {
      requireAuth: true,
      roles: ["admin"],
    },
  }
);

