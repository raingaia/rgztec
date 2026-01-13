export const runtime = "nodejs";

import { makeJsonCrudRoute } from "../_common";

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "src/data/stores/stores.json",
  {
    module: "stores",
    public: {
      allowQuery: true,
      activeOnly: true,
      queryFields: ["name", "title", "slug"],
      tagsField: "tags",
    },
    write: {
      requireAuth: true,
      roles: ["admin"],
    },
  }
);


