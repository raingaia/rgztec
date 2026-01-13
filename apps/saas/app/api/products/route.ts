export const runtime = "nodejs";

import { makeJsonCrudRoute } from "../_common";

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "src/data/products/products.json",
  {
    module: "products",
    idField: "id",
    public: {
      publicReadable: true,        // GET çalışsın
      activeOnly: true,            // public için sadece active
      allowQuery: true,
      queryFields: ["title", "slug", "category"],
      tagsField: "tags",
      requireStoreKey: false,
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

