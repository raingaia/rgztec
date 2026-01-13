export const runtime = "nodejs";

import { makeJsonCrudRoute } from "../../_common";

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "src/data/hardware/products.json",
  {
    module: "hardware_products",
    public: {
      allowQuery: true,
      activeOnly: true,
      queryFields: [
        "sku",
        "name",
        "title",
        "brand",
        "category",
        "short_description",
      ],
      tagsField: "tags",
    },
    write: {
      requireAuth: true,
      roles: ["admin", "seller"],
    },
  }
);
