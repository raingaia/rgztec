// apps/saas/app/api/orders/[id]/route.ts
export const runtime = "nodejs";

import { json, normalizeStr, readJson, getBearer, findActorByToken } from "@common";

const ORDERS_FILE = "@data/orders/orders.json";
const ITEMS_FILE = "@data/orders/order_items.json";
const EVENTS_FILE = "@data/orders/order_events.json";

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

// ✅ params'ı Promise olarak tanımladık
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = getBearer(req);
    if (!token) return json({ error: "Unauthorized", module: "orders" }, 401);

    const actor = await findActorByToken(token);
    if (!actor) return json({ error: "Unauthorized", module: "orders" }, 401);

    // ✅ KRİTİK: params'ı burada bekleyerek id'yi alıyoruz
    const resolvedParams = await params;
    const orderId = normalizeStr(resolvedParams.id);

    const orders = (await readJson<any[]>(ORDERS_FILE, [])) ?? [];
    const order = orders.find((x) => normalizeStr(x?.id) === orderId);
    if (!order) return json({ error: "Not found", module: "orders" }, 404);

    if (!isAllowedForOrder(actor, order)) {
      return json({ error: "Forbidden", module: "orders" }, 403);
    }

    const items = (await readJson<any[]>(ITEMS_FILE, [])) ?? [];
    const events = (await readJson<any[]>(EVENTS_FILE, [])) ?? [];

    const outItems = items.filter((x) => normalizeStr(x?.order_id) === orderId);
    const outEvents = events
      .filter((x) => normalizeStr(x?.order_id) === orderId)
      .sort((a, b) => String(a?.at || "").localeCompare(String(b?.at || "")));

    return json({ order, items: outItems, events: outEvents, module: "orders" }, 200);
  } catch (e: any) {
    return json({ error: e?.message || "GET failed", module: "orders" }, 500);
  }
}