import { makeJsonRoute } from "../_common";

export const { GET, POST, PUT, DELETE } = makeJsonRoute("src/data/settings/security.json", {
  module: "settings_security",
  public: { allowQuery: false, activeOnly: false },
  write: { requireAuth: true, roles: ["seller", "admin"] },
});
