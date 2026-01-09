import { json, normalizeStr, readJson, getBearer, findActorByToken } from "../../../_common";

const ORDERS_FILE = "src/data/orders/orders.json";
const ITEMS_FILE = "src/data/orders/order_items.json";

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

export async function GET(req: Request, ctx: { params: { id: string } }) {
  try {
    const token = getBearer(req);
    const actor = await findActorByToken(token);
    if (!actor) return json({ error: "Unauthorized", module: "order_items" }, 401);

    const orderId = normalizeStr(ctx.params.id);

    // order permission check
    const orders = (await readJson(ORDERS_FILE, [])) as any[];
    const order = (Array.isArray(orders) ? orders : []).find((x) => normalizeStr(x?.id) === orderId);
    if (!order) return json({ error: "Not found", module: "order_items" }, 404);
    if (!isAllowedForOrder(actor, order)) return json({ error: "Forbidden", module: "order_items" }, 403);

    const items = (await readJson(ITEMS_FILE, [])) as any[];
    const out = (Array.isArray(items) ? items : []).filter((x) => normalizeStr(x?.order_id) === orderId);

    return json({ items: out, order_id: orderId, module: "order_items" }, 200);
  } catch (e: any) {
    return json({ error: e?.message || "GET failed", module: "order_items" }, 500);
  }
}
