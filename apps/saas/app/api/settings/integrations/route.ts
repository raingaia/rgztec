import { makeJsonRoute } from "../_common";

export const { GET, POST, PUT, DELETE } = makeJsonRoute("src/data/settings/integrations.json", {
  module: "settings_integrations",
  public: { allowQuery: false, activeOnly: false },
  write: { requireAuth: true, roles: ["seller", "admin"] },
});

