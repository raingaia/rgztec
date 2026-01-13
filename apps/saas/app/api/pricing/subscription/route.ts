export const runtime = "nodejs";

import { makeJsonCrudRoute } from "../../_common";

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "src/data/pricing/subscriptions.json",
  {
    module: "pricing_subscriptions",
    idField: "id",
    public: {
      publicReadable: false, // private
    },
    write: {
      requireAuth: true,
      roles: ["seller", "admin"],
    },
  }
);

