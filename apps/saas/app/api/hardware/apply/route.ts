import { makeJsonRoute } from "../_common"; // (konumuna göre düzelt: "../../_common" olabilir)
import { guardApi } from "@/src/lib/auth/guard";

const base = makeJsonRoute("src/data/hardware/applications.json", {
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

export const GET = async (req: Request) => {
  const g = await guardApi(req, { requireAuth: true, roles: ["seller", "admin"] });
  if (g instanceof Response) return g;
  return base.GET(req);
};

export const POST = async (req: Request) => {
  const g = await guardApi(req, { requireAuth: true, roles: ["seller", "admin"] });
  if (g instanceof Response) return g;

  const body = await req.json();

  const enriched = {
    ...body,
    id: body.id || `hwapp_${Date.now()}`,
    seller_id: body.seller_id || g.user?.id, // guardApi user veriyorsa
    status: body.status || "pending",
    created_at: body.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const newReq = new Request(req.url, {
    method: "POST",
    headers: req.headers,
    body: JSON.stringify(enriched),
  });

  return base.POST(newReq);
};
