export const runtime = "nodejs";

import { makeJsonCrudRoute } from "../../_common";

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "src/data/pricing/plans.json",
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

