import { makeJsonRoute } from "../../_common";

export const { GET, POST, PUT, DELETE } = makeJsonRoute(
  "src/data/products/product_events.json",
  {
    module: "product_events",
    idField: "id",
    public: {
      publicReadable: false,
      allowQuery: true,
      queryFields: ["product_id", "type", "actor_id"],
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
