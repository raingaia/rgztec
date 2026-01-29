// apps/saas/app/api/orders/route.ts
export const runtime = "nodejs";

import { makeJsonCrudRoute } from "@common";   // ✅ alias kullanıldı

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "@data/orders/orders.json",                  // ✅ alias kullanıldı
  {
    module: "orders",
    public: {
      publicReadable: false,
    },
    write: {
      requireAuth: true,
      roles: ["buyer", "seller", "admin"],
    },
  }
);
