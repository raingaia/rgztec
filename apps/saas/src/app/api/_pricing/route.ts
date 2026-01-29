export const runtime = "nodejs";

import { makeJsonCrudRoute } from "@common";

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "@data/_pricing/pricing.json",
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

