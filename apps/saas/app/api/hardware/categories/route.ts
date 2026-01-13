export const runtime = "nodejs";

import { makeJsonCrudRoute } from "../_common";

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "src/data/hardware/categories.json",
  {
    module: "hardware_categories",
    public: {
      allowQuery: true,
      activeOnly: true,
      queryFields: ["name", "title"],
      tagsField: "tags",
    },
    write: {
      requireAuth: true,
      roles: ["admin", "seller"],
    },
  }
);

