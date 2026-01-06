import { makeJsonRoute } from "../_common";

export const { GET, POST, PUT, DELETE } = makeJsonRoute("src/data/search/search.index.json", {
  module: "search",
  public: {
    allowQuery: true,
    activeOnly: true,
    queryFields: ["name", "title"],
    tagsField: "tags",
  },
  write: {
    requireAuth: true,
    roles: ["admin"],
  },
});

