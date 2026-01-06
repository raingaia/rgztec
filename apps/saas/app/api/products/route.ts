import { makeJsonRoute } from "../_common";

export const { GET, POST, PUT, DELETE } = makeJsonRoute("src/data/products/products.json", {
  module: "products",
  public: {
    requireStoreKey: true,
    activeOnly: true,
    allowQuery: true,
    queryFields: ["title", "name"],
    tagsField: "tags",
  },
  write: {
    requireAuth: true,
    roles: ["seller", "admin"],
    ownerKey: "store_key",
    allowStatusActiveForAdminOnly: true,
  },
});

