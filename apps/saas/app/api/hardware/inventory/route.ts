import { makeJsonRoute } from "../../_common";

export const { GET, POST, PUT, DELETE } = makeJsonRoute(
  "src/data/hardware/inventory.json",
  {
    module: "hardware_inventory",
    public: {
      // stok public olsun mu? bence şimdilik kapalı tut:
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
