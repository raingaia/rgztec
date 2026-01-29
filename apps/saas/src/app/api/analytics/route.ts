export const runtime = "nodejs";

import { makeJsonCrudRoute } from "../_common";

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "src/data/analytics/analytics.json",
  {
    module: "analytics",
    public: {
      allowQuery: true,
      activeOnly: false,
    },
    write: {
      requireAuth: true,
      roles: ["admin"],
    },
  }
);
