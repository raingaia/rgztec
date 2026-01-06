import { makeJsonRoute } from "../_common";
import { guardApi } from "@/src/lib/auth/guard";

const base = makeJsonRoute("src/data/hardware/stores.json", {
  module: "hardware_store",
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
  return base.GET(req);
};

export const POST = async (req: Request) => {
  const g = await guardApi(req, { requireAuth: true, roles: ["seller", "admin"] });
  if (g instanceof Response) return g;
  return base.POST(req);
};

export const PUT = async (req: Request) => {
  const g = await guardApi(req, { requireAuth: true, roles: ["seller", "admin"] });
  if (g instanceof Response) return g;
  return base.PUT(req);
};
