import { makeJsonRoute } from "../_common";

export const { GET, POST, PUT, DELETE } = makeJsonRoute("src/data/analytics/analytics.json", {
  module: "analytics",
  public: {
    allowQuery: true,
    activeOnly: false,
  },
  write: {
    requireAuth: true,
    roles: ["admin"],
  },
});
