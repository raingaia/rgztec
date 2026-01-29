// apps/saas/app/api/hardware/products/route.ts
export const runtime = "nodejs";

import { makeJsonCrudRoute } from "@common";   // ✅ alias kullanıldı

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "@data/hardware/products.json",              // ✅ alias kullanıldı
  {
    module: "hardware_products",
    public: {
      allowQuery: true,
      activeOnly: true,
      queryFields: [
        "sku",
        "name",
        "title",
        "brand",
        "category",
        "short_description",
      ],
      tagsField: "tags",
    },
    write: {
      requireAuth: true,
      roles: ["admin", "seller"],
    },
  }
);
