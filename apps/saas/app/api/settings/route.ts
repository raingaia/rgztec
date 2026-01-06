import { makeJsonRoute } from "../_common";

export const { GET, POST, PUT, DELETE } = makeJsonRoute("src/data/settings/settings.json", {
  module: "settings",
  public: {
    // settings genelde public olabilir (site config vs)
    allowQuery: false,
    activeOnly: false,
  },
  write: {
    requireAuth: true,
    roles: ["admin"],
  },
});

