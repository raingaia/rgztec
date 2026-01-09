import { makeJsonRoute } from "../../_common";

export const { GET, POST, PUT, DELETE } = makeJsonRoute(
  "src/data/products/product_assets.json",
  {
    module: "product_assets",
    idField: "id",
    public: {
      // public tarafta sadece "public" işaretli asset'ler dönsün istiyorsan
      // şimdilik kapalı: güvenli
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
