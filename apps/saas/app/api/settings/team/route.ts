export const runtime = "nodejs";

import { makeJsonCrudRoute } from "../../_common";

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "src/data/settings/team.json",
  {
    module: "settings_team",
    public: { allowQuery: false, activeOnly: false },
    write: { requireAuth: true, roles: ["seller", "admin"] },
  }
);


