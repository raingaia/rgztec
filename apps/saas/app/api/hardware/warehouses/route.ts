import { makeJsonRoute } from "../../_common";

export const { GET, POST, PUT, DELETE } = makeJsonRoute(
  "src/data/hardware/warehouses.json",
  {
    module: "hardware_warehouses",
    public: {
      publicReadable: false,
      allowQuery: true,
      queryFields: ["name", "city", "country"],
      tagsField: "tags",
    },
    write: {
      requireAuth: true,
      roles: ["admin"],
    },
  }
);
