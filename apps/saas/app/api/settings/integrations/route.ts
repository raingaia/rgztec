export const runtime = "nodejs";

import { makeJsonCrudRoute } from "../../_common";

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "src/data/settings/integrations.json",
  {
    module: "settings_integrations",
    public: { allowQuery: false, activeOnly: false },
    write: { requireAuth: true, roles: ["seller", "admin"] },
  }
);


