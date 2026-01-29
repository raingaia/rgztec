// apps/saas/app/api/pricing/portal/route.ts
export const runtime = "nodejs";

import { json, getBearer, findActorByToken } from "@common";   // ✅ alias kullanıldı

/**
 * POST /api/pricing/portal
 */
export async function POST(req: Request) {
  try {
    const token = getBearer(req);
    if (!token) return json({ error: "Unauthorized", module: "pricing_portal" }, 401);

    const actor = await findActorByToken(token);
    if (!actor) return json({ error: "Unauthorized", module: "pricing_portal" }, 401);
    if (!["seller", "admin"].includes(actor.role))
      return json({ error: "Forbidden", module: "pricing_portal" }, 403);

    return json(
      {
        ok: false,
        module: "pricing_portal",
        note: "Stripe Billing Portal not configured yet (stub).",
        next: "TODO: create Stripe billing portal session + return url",
      },
      501
    );
  } catch (e: any) {
    return json({ error: e?.message || "portal failed", module: "pricing_portal" }, 500);
  }
}
