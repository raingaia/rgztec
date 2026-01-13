export const runtime = "nodejs";

import { makeJsonCrudRoute } from "../../_common";

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "src/data/products/product_assets.json",
  {
    module: "product_assets",
    idField: "id",
    public: {
      publicReadable: false,
      allowQuery: true,
      queryFields: ["product_id", "label", "kind"],
      tagsField: "tags",
    },
    write: {
      requireAuth: true,
      roles: ["seller", "admin"],
      ownerKey: "store_key",
      writeMode: "file",
    },
  }
);

