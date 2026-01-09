import { makeJsonRoute } from "../_common";

export const { GET, POST, PUT, DELETE } = makeJsonRoute(
  "src/data/products/products.json",
  {
    module: "products",
    idField: "id",
    public: {
      publicReadable: true,        // GET çalışsın
      activeOnly: true,            // PUBLIC için activeOnly (engine bunu uygular)
      allowQuery: true,
      queryFields: ["title", "slug", "category"],
      tagsField: "tags",
      requireStoreKey: false
    },
    write: {
      requireAuth: true,
      roles: ["seller", "admin"],
      ownerKey: "store_key",
      // seller active yapamasın (senin common’da bu opsiyon varsa aç)
      allowStatusActiveForAdminOnly: true,
      writeMode: "file"
    }
  }
);

