import { makeJsonRoute } from "../../_common";

export const { GET, POST, PUT, DELETE } = makeJsonRoute("src/data/analytics/revenue.json", {
  module: "analytics_revenue",
  public: { allowQuery: false, activeOnly: false },
  write: { requireAuth: true, roles: ["seller", "admin"] },
});
