// apps/saas/app/api/pricing/plans/route.ts
export const runtime = "nodejs";

import { makeJsonCrudRoute } from "@common";   // ✅ alias kullanıldı

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "@data/pricing/plans.json",                  // ✅ alias kullanıldı
  {
    module: "pricing_plans",
    idField: "id",
    public: {
      publicReadable: true,
      allowQuery: true,
      queryFields: ["id", "name", "badge"],
    },
    write: {
      requireAuth: true,
      roles: ["admin"],
    },
  }
);
