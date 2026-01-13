export const runtime = "nodejs";

import { makeJsonCrudRoute } from "../_common";

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "src/data/pricing/plans.json",
  {
    module: "pricing",
    public: {
      allowQuery: true,
      activeOnly: true,
      queryFields: ["name", "title", "plan"],
      tagsField: "tags",
    },
    write: {
      requireAuth: true,
      roles: ["admin"],
    },
  }
);

