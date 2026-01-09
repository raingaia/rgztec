import {
  json,
  normalizeStr,
  nowISO,
  makeId,
  readJson,
  writeJson,
  getBearer,
  findActorByToken,
} from "../../../_common";

const ORDERS_FILE = "src/data/orders/orders.json";
const EVENTS_FILE = "src/data/orders/order_events.json";

const ALLOWED: Record<string, string[]> = {
  pending: ["processing", "on_hold", "cancelled"],
  processing: ["on_hold", "shipped", "cancelled"],
  on_hold: ["processing", "cancelled"],
  shipped: ["delivered", "refunded"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

function canTransition(from: string, to: string) {
  return (ALLOWED[from] || []).includes(to);
}

function isSellerOrAdmin(actor: any) {
  return actor && (actor.role === "admin" || actor.role === "seller");
}

function sellerOwnsOrder(actor: any, order: any) {
  if (!actor) return false;
  if (actor.role === "admin") return true;
  const sellerId = normalizeStr(order?.seller_id);
  return actor.role === "seller" && sellerId && normalizeStr(actor.id) === sellerId;
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  try {
    const token = getBearer(req);
    const actor = await findActorByToken(token);
    if (!actor) return json({ error: "Unauthorized", module: "orders" }, 401);
    if (!isSellerOrAdmin(actor)) return json({ error: "Forbidden", module: "orders" }, 403);

    const orderId = normalizeStr(ctx.params.id);
    const body = await req.json().catch(() => ({} as any));

    const to = normalizeStr(body?.to);
    const note = normalizeStr(body?.note);

    if (!to) return json({ error: "to required", module: "orders" }, 400);

    const orders = (await readJson(ORDERS_FILE, [])) as any[];
    const arr = Array.isArray(orders) ? orders : [];

    const idx = arr.findIndex((x) => normalizeStr(x?.id) === orderId);
    if (idx < 0) return json({ error: "Not found", module: "orders" }, 404);

    const existing = arr[idx];
    if (!sellerOwnsOrder(actor, existing)) return json({ error: "Forbidden", module: "orders" }, 403);

    const from = normalizeStr(existing?.status);
    if (from === to) return json({ ok: true, order: existing, module: "orders", note: "no change" }, 200);

    if (!canTransition(from, to)) {
      return json({ error: "Invalid status transition", from, to, module: "orders" }, 409);
    }

    const updated = { ...existing, status: to, updated_at: nowISO() };
    arr[idx] = updated;

    const events = (await readJson(EVENTS_FILE, [])) as any[];
    const evArr = Array.isArray(events) ? events : [];

    evArr.push({
      id: makeId("evt"),
      order_id: orderId,
      store_key: updated.store_key,
      seller_id: updated.seller_id,
      at: nowISO(),
      type: "status_changed",
      message: `Status changed: ${from} → ${to}`,
      actor: { role: actor.role, id: actor.id },
      data: { from, to, note: note || null },
    });

    await writeJson(ORDERS_FILE, arr);
    await writeJson(EVENTS_FILE, evArr);

    return json({ ok: true, order: updated, module: "orders" }, 200);
  } catch (e: any) {
    return json({ error: e?.message || "POST status failed", module: "orders" }, 500);
  }
}
