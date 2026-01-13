export const runtime = "nodejs";

import { makeJsonCrudRoute } from "../_common";

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "src/data/banners/banners.json",
  {
    module: "banners",
    public: {
      allowQuery: true,
      activeOnly: true,
      queryFields: ["title", "name", "sponsor", "brand"],
      tagsField: "tags",
    },
    write: {
      requireAuth: true,
      roles: ["seller", "admin"],
      ownerKey: "store_key",
      allowStatusActiveForAdminOnly: true,
    },
  }
);

