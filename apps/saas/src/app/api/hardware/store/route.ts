// apps/saas/app/api/hardware/stores/route.ts
export const runtime = "nodejs";

// ✅ guardApi'yi de import listesine ekledik
import { makeJsonCrudRoute, guardApi } from "@common";

const base = makeJsonCrudRoute("@data/hardware/stores.json", {
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
  // ✅ Doğru guardApi kullanımı: error varsa onu dön
  const { error } = await guardApi(req, { requireAuth: true, roles: ["seller", "admin"] });
  if (error) return error;
  return base.GET(req as any);
};

export const POST = async (req: Request) => {
  const { error } = await guardApi(req, { requireAuth: true, roles: ["seller", "admin"] });
  if (error) return error;
  return base.POST(req as any);
};

export const PUT = async (req: Request) => {
  const { error } = await guardApi(req, { requireAuth: true, roles: ["seller", "admin"] });
  if (error) return error;
  return base.PUT(req as any);
};