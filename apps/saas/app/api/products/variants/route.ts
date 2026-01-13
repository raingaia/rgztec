export const runtime = "nodejs";

import { makeJsonCrudRoute } from "../../_common";

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "src/data/products/product_variants.json",
  {
    module: "product_variants",
    idField: "id",
    public: {
      publicReadable: false,
      allowQuery: true,
      queryFields: ["product_id", "name", "sku"],
      tagsField: "tags",
    },
    write: {
      requireAuth: true,
      roles: ["seller", "admin"],
      ownerKey: "store_key",
      allowStatusActiveForAdminOnly: true,
      writeMode: "file",
    },
  }
);
