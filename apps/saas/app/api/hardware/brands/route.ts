export const runtime = "nodejs";

import { makeJsonCrudRoute } from "../_common";

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "src/data/hardware/brands.json",
  {
    module: "hardware_brands",
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

