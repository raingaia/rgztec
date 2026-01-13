export const runtime = "nodejs";

import { makeJsonCrudRoute } from "../_common";

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "src/data/hardware/inventory.json",
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
