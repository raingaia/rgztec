export const runtime = "nodejs";

import { makeJsonCrudRoute } from "../_common";

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "src/data/_pricing/pricing.json",
  {
    module: "_pricing",
    public: {
      publicReadable: true, // istersen false yaparız
    },
    write: {
      requireAuth: true,
      roles: ["admin"], // sadece admin değiştirsin
    },
  }
);
