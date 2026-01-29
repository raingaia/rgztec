// apps/saas/app/api/products/product_events/route.ts
export const runtime = "nodejs";

import { makeJsonCrudRoute } from "@common";   // ✅ alias kullanıldı

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "@data/products/product_events.json",        // ✅ alias kullanıldı
  {
    module: "product_events",
    idField: "id",
    public: {
      publicReadable: false,
      allowQuery: true,
      queryFields: ["product_id", "type", "actor_id"],
      tagsField: "tags",
    },
    write: {
      requireAuth: true,
      roles: ["seller", "admin"],
      ownerKey: "store_key",
      writeMode: "file",
    },
  }
);


