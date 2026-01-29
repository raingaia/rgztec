// apps/saas/app/api/settings/integrations/route.ts
export const runtime = "nodejs";

import { makeJsonCrudRoute } from "@common";   // ✅ alias kullanıldı

export const { GET, POST, PUT, DELETE } = makeJsonCrudRoute(
  "@data/settings/integrations.json",          // ✅ alias kullanıldı
  {
    module: "settings_integrations",
    public: { allowQuery: false, activeOnly: false },
    write: { requireAuth: true, roles: ["seller", "admin"] },
  }
);



