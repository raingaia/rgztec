export const runtime = "nodejs";

import { makeJsonCrudRoute } from "../_common";

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "src/data/settings/settings.json",
  {
    module: "settings",
    public: {
      allowQuery: false,
      activeOnly: false,
    },
    write: {
      requireAuth: true,
      roles: ["admin"],
    },
  }
);


