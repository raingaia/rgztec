import { makeJsonRoute } from "../_common";

export const { GET, POST, PUT, DELETE } = makeJsonRoute("src/data/banners/banners.json", {
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
});

