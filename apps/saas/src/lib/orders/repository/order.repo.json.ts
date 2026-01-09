import { promises as fs } from "node:fs";
import path from "node:path";
import type { OrderRepository, ListArgs, ListResult } from "./order.repo";
import type { Order, OrderEvent, OrderItem } from "../types";

const base = path.join(process.cwd(), "apps/saas/src/data/orders");

async function readJson<T>(file: string): Promise<T> {
  const p = path.join(base, file);
  const raw = await fs.readFile(p, "utf8");
  return JSON.parse(raw) as T;
}

async function writeJson<T>(file: string, data: T): Promise<void> {
  const p = path.join(base, file);
  await fs.writeFile(p, JSON.stringify(data, null, 2), "utf8");
}

export class JsonOrderRepository implements OrderRepository {
  async listOrders(args: ListArgs): Promise<ListResult<Order>> {
    const { orders } = await readJson<{ orders: Order[] }>("orders.json");

    let filtered = orders.slice();

    if (args.seller_id) filtered = filtered.filter(o => o.seller_id === args.seller_id);
    if (args.status) filtered = filtered.filter(o => o.status === args.status);
    if (args.q) {
      const q = args.q.toLowerCase();
      filtered = filtered.filter(o =>
        o.number.toLowerCase().includes(q) ||
        o.customer?.email?.toLowerCase().includes(q) ||
        o.customer?.name?.toLowerCase().includes(q)
      );
    }

    // newest first
    filtered.sort((a,b) => (b.created_at.localeCompare(a.created_at)));

    const limit = args.limit ?? 20;
    // Basit cursor: created_at|id
    let startIndex = 0;
    if (args.cursor) {
      const idx = filtered.findIndex(o => `${o.created_at}|${o.id}` === args.cursor);
      startIndex = idx >= 0 ? idx + 1 : 0;
    }

    const page = filtered.slice(startIndex, startIndex + limit);
    const last = page[page.length - 1];
    const next_cursor = last ? `${last.created_at}|${last.id}` : null;

    return { data: page, next_cursor };
  }

  async getOrder(id: string) {
    const { orders } = await readJson<{ orders: Order[] }>("orders.json");
    return orders.find(o => o.id === id) ?? null;
  }

  async getOrderItems(orderId: string) {
    const { items } = await readJson<{ items: OrderItem[] }>("order_items.json");
    return items.filter(i => i.order_id === orderId);
  }

  async getOrderEvents(orderId: string) {
    const { events } = await readJson<{ events: OrderEvent[] }>("order_events.json");
    return events.filter(e => e.order_id === orderId).sort((a,b)=> a.at.localeCompare(b.at));
  }

  async updateOrder(order: Order) {
    const db = await readJson<{ orders: Order[] }>("orders.json");
    const idx = db.orders.findIndex(o => o.id === order.id);
    if (idx < 0) throw new Error("Order not found");
    db.orders[idx] = order;
    await writeJson("orders.json", db);
  }

  async appendEvent(evt: OrderEvent) {
    const db = await readJson<{ events: OrderEvent[] }>("order_events.json");
    db.events.push(evt);
    await writeJson("order_events.json", db);
  }
}
