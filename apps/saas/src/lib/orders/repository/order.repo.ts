import type { Order, OrderEvent, OrderItem } from "../types";

export type ListArgs = {
  q?: string;
  status?: string;
  seller_id?: string;
  limit?: number;
  cursor?: string; // basit cursor (id/time)
};

export type ListResult<T> = { data: T[]; next_cursor: string | null };

export interface OrderRepository {
  listOrders(args: ListArgs): Promise<ListResult<Order>>;
  getOrder(id: string): Promise<Order | null>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  getOrderEvents(orderId: string): Promise<OrderEvent[]>;

  updateOrder(order: Order): Promise<void>;
  appendEvent(evt: OrderEvent): Promise<void>;
}
