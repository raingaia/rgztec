// apps/saas/app/api/users/route.ts
export const runtime = "nodejs";

import { makeJsonCrudRoute } from "@common";   // ✅ alias kullanıldı

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "@data/users/users.json",                    // ✅ alias kullanıldı
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


