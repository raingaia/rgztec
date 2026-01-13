// apps/saas/app/api/orders/route.ts  (veya senin gerçek path'in)
export const runtime = "nodejs";

import { makeJsonCrudRoute } from "../_common";

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "src/data/orders/orders.json",
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

