export const runtime = "nodejs";

import { makeJsonCrudRoute } from "@common";

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "@data/analytics/orders.json",
  {
    module: "analytics_orders",
    public: { allowQuery: false, activeOnly: false },
    write: { requireAuth: true, roles: ["seller", "admin"] },
  }
);
