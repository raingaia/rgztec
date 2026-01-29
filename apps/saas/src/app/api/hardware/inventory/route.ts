// apps/saas/app/api/hardware/inventory/route.ts
export const runtime = "nodejs";

import { makeJsonCrudRoute } from "@common";   // ✅ alias kullanıldı

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "@data/hardware/inventory.json",             // ✅ alias kullanıldı
  {
    module: "hardware_inventory",
    public: {
      publicReadable: false,
      allowQuery: true,
      queryFields: ["product_id", "sku", "warehouse_id"],
    },
    write: {
      requireAuth: true,
      roles: ["admin", "seller"],
    },
  }
);
