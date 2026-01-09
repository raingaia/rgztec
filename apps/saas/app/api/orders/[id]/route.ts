import { json, normalizeStr, readJson, getBearer, findActorByToken } from "../../_common";

const ORDERS_FILE = "src/data/orders/orders.json";
const ITEMS_FILE = "src/data/orders/order_items.json";
const EVENTS_FILE = "src/data/orders/order_events.json";

function isAllowedForOrder(actor: any, order: any) {
  if (!actor) return false;
  if (actor.role === "admin") return true;

  const sellerId = normalizeStr(order?.seller_id);
  const buyerId = normalizeStr(order?.buyer_id); // varsa
  const storeKey = normalizeStr(order?.store_key);

  // seller kendi seller_id'si ile erişir
  if (actor.role === "seller" && sellerId && normalizeStr(actor.id) === sellerId) return true;

  // buyer kendi buyer_id'si ile erişir (order schema'da buyer_id varsa)
  if (actor.role === "buyer" && buyerId && normalizeStr(actor.id) === buyerId) return true;

  // store_key bazlı erişim (actor.stores listesi varsa)
  if (storeKey && Array.isArray(actor.stores) && actor.stores.includes(storeKey)) return true;

  return false;
}

export async function GET(req: Request, ctx: { params: { id: string } }) {
  try {
    // ---- Auth (orders publicReadable:false mantığı) ----
    const token = getBearer(req);
    const actor = await findActorByToken(token);
    if (!actor) return json({ error: "Unauthorized", module: "orders" }, 401);

    const orderId = normalizeStr(ctx.params.id);

    const orders = (await readJson(ORDERS_FILE, [])) as any[];
    const order = (Array.isArray(orders) ? orders : []).find((x) => normalizeStr(x?.id) === orderId);
    if (!order) return json({ error: "Not found", module: "orders" }, 404);

    if (!isAllowedForOrder(actor, order)) {
      return json({ error: "Forbidden", module: "orders" }, 403);
    }

    const items = (await readJson(ITEMS_FILE, [])) as any[];
    const events = (await readJson(EVENTS_FILE, [])) as any[];

    const outItems = (Array.isArray(items) ? items : []).filter((x) => normalizeStr(x?.order_id) === orderId);

    const outEvents = (Array.isArray(events) ? events : [])
      .filter((x) => normalizeStr(x?.order_id) === orderId)
      .sort((a, b) => String(a?.at || "").localeCompare(String(b?.at || "")));

    return json({ order, items: outItems, events: outEvents, module: "orders" }, 200);
  } catch (e: any) {
    return json({ error: e?.message || "GET failed", module: "orders" }, 500);
  }
}
