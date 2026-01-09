import { makeJsonRoute } from "../_common";

export const { GET, POST, PUT, DELETE } = makeJsonRoute(
  "src/data/orders/orders.json",
  {
    module: "orders",
    public: {
      // orders public olmayacak: default kapalı
      publicReadable: false,
    },
    write: {
      requireAuth: true,
      roles: ["buyer", "seller", "admin"],
    },
  }
);

