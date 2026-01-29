// apps/saas/app/api/pricing/checkout/route.ts
export const runtime = "nodejs";

import { json, getBearer, findActorByToken, normalizeStr, readJson } from "@common";   // ✅ alias kullanıldı

const PLANS_FILE = "@data/pricing/plans.json";   // ✅ alias kullanıldı

export async function POST(req: Request) {
  try {
    const token = getBearer(req);
    if (!token) return json({ error: "Unauthorized", module: "pricing_checkout" }, 401);

    const actor = await findActorByToken(token);
    if (!actor) return json({ error: "Unauthorized", module: "pricing_checkout" }, 401);
    if (!["seller", "admin"].includes(actor.role))
      return json({ error: "Forbidden", module: "pricing_checkout" }, 403);

    const body = await req.json().catch(() => ({} as any));
    const planId = normalizeStr(body?.plan_id);
    const period = normalizeStr(body?.period || "monthly");

    if (!planId) return json({ error: "plan_id required", module: "pricing_checkout" }, 400);
    if (period !== "monthly")
      return json({ error: "Only monthly supported (for now)", module: "pricing_checkout" }, 400);

    const plans = (await readJson<any[]>(PLANS_FILE, [])) ?? [];
    const plan = plans.find(
      (p) => normalizeStr(p?.id) === planId && normalizeStr(p?.status) === "active"
    );
    if (!plan) return json({ error: "Plan not found", module: "pricing_checkout" }, 404);

    return json(
      {
        ok: false,
        module: "pricing_checkout",
        note: "Stripe not configured yet. This endpoint is a stub.",
        requested: { plan_id: planId, period },
        next: "TODO: integrate Stripe Checkout subscription session + return session.url",
      },
      501
    );
  } catch (e: any) {
    return json({ error: e?.message || "checkout failed", module: "pricing_checkout" }, 500);
  }
}
