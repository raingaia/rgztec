// apps/saas/app/api/hardware/apply/route.ts
export const runtime = "nodejs";

import { makeJsonCrudRoute } from "../_common";
import { guardApi } from "../_common_auth/guard";

const engine = makeJsonCrudRoute("src/data/hardware/applications.json", {
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

export async function GET(req: Request) {
  const g = await guardApi(req, { requireAuth: true, roles: ["seller", "admin"] });
  if (g instanceof Response) return g;
  return engine.GET(req as any);
}

export async function POST(req: Request) {
  const g = await guardApi(req, { requireAuth: true, roles: ["seller", "admin"] });
  if (g instanceof Response) return g;
  return engine.POST(req as any);
}

export async function PUT(req: Request) {
  const g = await guardApi(req, { requireAuth: true, roles: ["seller", "admin"] });
  if (g instanceof Response) return g;
  return engine.PUT(req as any);
}

export async function DELETE(req: Request) {
  const g = await guardApi(req, { requireAuth: true, roles: ["seller", "admin"] });
  if (g instanceof Response) return g;
  return engine.DELETE(req as any);
}
