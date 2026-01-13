export const runtime = "nodejs";

import { makeJsonCrudRoute } from "../../_common";
import { guardApi } from "../../_common_auth/guard";

const base = makeJsonCrudRoute("src/data/hardware/status.json", {
  module: "hardware_status",
  public: { requireStoreKey: false, activeOnly: false, allowQuery: false },
  write: {
    requireAuth: true,
    roles: ["seller", "admin"],
    ownerKey: "seller_id",
    allowStatusActiveForAdminOnly: true,
  },
});

export const GET = async (req: Request) => {
  const g = await guardApi(req, { requireAuth: true, roles: ["seller", "admin"] });
  if (g instanceof Response) return g;
  return base.GET(req as any);
};

export const PUT = async (req: Request) => {
  const g = await guardApi(req, { requireAuth: true, roles: ["admin"] });
  if (g instanceof Response) return g;
  return base.PUT(req as any);
};
