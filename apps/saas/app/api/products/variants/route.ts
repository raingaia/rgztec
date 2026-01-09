import { makeJsonRoute } from "../../_common";

export const { GET, POST, PUT, DELETE } = makeJsonRoute(
  "src/data/products/product_variants.json",
  {
    module: "product_variants",
    idField: "id",
    public: {
      // storefront gerekirse açarız (activeOnly ile)
      publicReadable: false,
      allowQuery: true,
      queryFields: ["product_id", "name", "sku"],
      tagsField: "tags",
    },
    write: {
      requireAuth: true,
      roles: ["seller", "admin"],
      ownerKey: "store_key",
      // varyantta da active onayı admin olsun istersen:
      allowStatusActiveForAdminOnly: true,
      writeMode: "file",
    },
  }
);
