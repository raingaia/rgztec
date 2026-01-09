import { makeJsonRoute } from "../_common";

export const { GET, POST, PUT, DELETE } = makeJsonRoute("src/data/pricing/plans.json", {
  module: "pricing",
  public: {
    allowQuery: true,
    activeOnly: true,
    queryFields: ["name", "title", "plan"],
    tagsField: "tags",
  },
  write: {
    requireAuth: true,
    roles: ["admin"],
  },
});

