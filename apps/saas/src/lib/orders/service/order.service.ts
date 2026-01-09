import type { OrderRepository } from "../repository/order.repo";
import type { Order, OrderEvent, OrderStatus } from "../types";
import { canTransition } from "../constants";
import { Errors } from "../errors";

function nowIso() {
  return new Date().toISOString();
}
function makeEventId() {
  return `evt_${Math.random().toString(36).slice(2, 10)}`;
}

export class OrderService {
  constructor(private repo: OrderRepository) {}

  list(args: Parameters<OrderRepository["listOrders"]>[0]) {
    return this.repo.listOrders(args);
  }

  async get(id: string) {
    const order = await this.repo.getOrder(id);
    if (!order) throw Errors.NotFound("Order not found");
    return order;
  }

  async getDetail(id: string) {
    const order = await this.get(id);
    const [items, events] = await Promise.all([
      this.repo.getOrderItems(id),
      this.repo.getOrderEvents(id),
    ]);
    return { order, items, events };
  }

  async updateStatus(params: {
    id: string;
    to: OrderStatus;
    actor: { role: "admin" | "seller" | "system"; id: string };
    note?: string;
  }) {
    const order = await this.get(params.id);
    const from = order.status;

    if (from === params.to) return order;
    if (!canTransition(from, params.to)) {
      throw Errors.Conflict(`Invalid status transition: ${from} -> ${params.to}`, { from, to: params.to });
    }

    const updated: Order = { ...order, status: params.to, updated_at: nowIso() };
    await this.repo.updateOrder(updated);

    const evt: OrderEvent = {
      id: makeEventId(),
      order_id: updated.id,
      at: nowIso(),
      type: "status_changed",
      message: `Status changed: ${from} → ${params.to}`,
      actor: params.actor,
      data: { from, to: params.to, note: params.note ?? null },
    };
    await this.repo.appendEvent(evt);

    return updated;
  }

  async addNote(params: {
    id: string;
    note: string;
    actor: { role: "admin" | "seller"; id: string };
  }) {
    await this.get(params.id);

    const evt = {
      id: makeEventId(),
      order_id: params.id,
      at: nowIso(),
      type: "note_added" as const,
      message: "Note added",
      actor: params.actor,
      data: { note: params.note },
    };
    await this.repo.appendEvent(evt);
    return evt;
  }
}
