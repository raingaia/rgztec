export const runtime = "nodejs";

import { makeJsonCrudRoute } from "../../_common";

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "src/data/products/products.json",
  {
    module: "products_admin",
    public: {
      publicReadable: false,
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
