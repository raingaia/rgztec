// apps/saas/app/api/orders/[id]/items/route.ts
export const runtime = "nodejs";

import { json, normalizeStr, readJson, getBearer, findActorByToken } from "@common";

const ORDERS_FILE = "@data/orders/orders.json";
const ITEMS_FILE = "@data/orders/order_items.json";

function isAllowedForOrder(actor: any, order: any) {
  if (!actor) return false;
  if (actor.role === "admin") return true;

  const sellerId = normalizeStr(order?.seller_id);
  const buyerId = normalizeStr(order?.buyer_id);
  const storeKey = normalizeStr(order?.store_key);

  if (actor.role === "seller" && sellerId && normalizeStr(actor.id) === sellerId) return true;
  if (actor.role === "buyer" && buyerId && normalizeStr(actor.id) === buyerId) return true;
  if (storeKey && Array.isArray(actor.stores) && actor.stores.includes(storeKey)) return true;

  return false;
}

// ✅ params tipini Promise<{ id: string }> olarak güncelledik
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = getBearer(req);
    if (!token) return json({ error: "Unauthorized", module: "order_items" }, 401);

    const actor = await findActorByToken(token);
    if (!actor) return json({ error: "Unauthorized", module: "order_items" }, 401);

    // ✅ KRİTİK: params'ı burada bekleyerek (await) id'yi çıkarıyoruz
    const { id } = await params;
    const orderId = normalizeStr(id);

    const orders = (await readJson<any[]>(ORDERS_FILE, [])) ?? [];
    const order = orders.find((x) => normalizeStr(x?.id) === orderId);
    
    if (!order) return json({ error: "Not found", module: "order_items" }, 404);
    if (!isAllowedForOrder(actor, order)) return json({ error: "Forbidden", module: "order_items" }, 403);

    const items = (await readJson<any[]>(ITEMS_FILE, [])) ?? [];
    const out = items.filter((x) => normalizeStr(x?.order_id) === orderId);

    return json({ items: out, order_id: orderId, module: "order_items" }, 200);
  } catch (e: any) {
    return json({ error: e?.message || "GET failed", module: "order_items" }, 500);
  }
}