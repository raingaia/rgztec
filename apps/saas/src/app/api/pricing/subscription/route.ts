// apps/saas/app/api/pricing/subscriptions/route.ts
export const runtime = "nodejs";

import { makeJsonCrudRoute } from "@common";   // ✅ alias kullanıldı

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "@data/pricing/subscriptions.json",          // ✅ alias kullanıldı
  {
    module: "pricing_subscriptions",
    idField: "id",
    public: {
      publicReadable: false, // private
    },
    write: {
      requireAuth: true,
      roles: ["seller", "admin"],
    },
  }
);

