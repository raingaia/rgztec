// apps/saas/app/api/settings/route.ts
export const runtime = "nodejs";

import { makeJsonCrudRoute } from "@common";   // ✅ alias kullanıldı

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "@data/settings/settings.json",              // ✅ alias kullanıldı
  {
    module: "settings",
    public: {
      allowQuery: false,
      activeOnly: false,
    },
    write: {
      requireAuth: true,
      roles: ["admin"],
    },
  }
);


