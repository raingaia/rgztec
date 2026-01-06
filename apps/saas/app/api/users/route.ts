import { makeJsonRoute } from "../_common";

export const { GET, POST, PUT, DELETE } = makeJsonRoute("src/data/users/users.json", {
  module: "users",
  public: {
    // kullanıcı listesi public olmasın
    publicReadable: false,
  },
  write: {
    requireAuth: true,
    roles: ["admin"],
  },
});

