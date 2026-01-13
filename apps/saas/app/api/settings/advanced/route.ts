export const runtime = "nodejs";

import { makeJsonCrudRoute } from "../../_common";

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "src/data/settings/advanced.json",
  {
    module: "settings_advanced",
    public: { allowQuery: false, activeOnly: false },
    write: { requireAuth: true, roles: ["seller", "admin"] },
  }
);

