export const runtime = "nodejs";

import { makeJsonCrudRoute } from "../_common";

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "src/data/users/users.json",
  {
    module: "users",
    public: {
      publicReadable: false, // kullanıcı listesi public olmasın
    },
    write: {
      requireAuth: true,
      roles: ["admin"],
    },
  }
);


