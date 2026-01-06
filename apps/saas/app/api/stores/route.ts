import { makeJsonRoute } from "../_common";

export const { GET, POST, PUT, DELETE } = makeJsonRoute("src/data/stores/stores.json", {
  module: "stores",
  public: {
    allowQuery: true,
    activeOnly: true,
    queryFields: ["name", "title", "slug"],
    tagsField: "tags",
  },
  write: {
    requireAuth: true,
    roles: ["admin"],
  },
});

