// apps/saas/app/api/hardware/apply/route.ts
import { makeJsonRoute } from "../../_common"; // konum doğru: apply -> hardware -> api
import { guardApi } from "@/src/lib/auth/guard"; // sende guardApi adı buysa kalsın

// Hardware seller application list (dev json)
const engine = makeJsonRoute("src/data/hardware/applications.json", {
  module: "hardware_apply",
  public: {
    requireStoreKey: false,
    activeOnly: false,
    allowQuery: false,
  },
  write: {
    requireAuth: true,
    roles: ["seller", "admin"],
    ownerKey: "seller_id",
    allowStatusActiveForAdminOnly: true,
  },
});

// --- GET ---
export async function GET(req: Request) {
  const g = await guardApi(req, { requireAuth: true, roles: ["seller", "admin"] });
  if (g instanceof Response) return g;
  return engine.GET(req);
}

// --- POST ---
export async function POST(req: Request) {
  const g = await guardApi(req, { requireAuth: true, roles: ["seller", "admin"] });
  if (g instanceof Response) return g;
  return engine.POST(req);
}

// --- PUT ---
export async function PUT(req: Request) {
  const g = await guardApi(req, { requireAuth: true, roles: ["seller", "admin"] });
  if (g instanceof Response) return g;
  return engine.PUT(req);
}

// --- DELETE ---
export async function DELETE(req: Request) {
  const g = await guardApi(req, { requireAuth: true, roles: ["seller", "admin"] });
  if (g instanceof Response) return g;
  return engine.DELETE(req);
}

