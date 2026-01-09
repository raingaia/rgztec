import { makeJsonRoute } from "../_common";

export const { GET, POST, PUT, DELETE } = makeJsonRoute("src/data/settings/advanced.json", {
  module: "settings_advanced",
  public: { allowQuery: false, activeOnly: false },
  write: { requireAuth: true, roles: ["seller", "admin"] },
});
