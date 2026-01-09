import { makeJsonRoute } from "../../_common";

export const { GET, POST, PUT, DELETE } = makeJsonRoute("src/data/analytics/orders.json", {
  module: "analytics_orders",
  public: { allowQuery: false, activeOnly: false },
  write: { requireAuth: true, roles: ["seller", "admin"] },
});
