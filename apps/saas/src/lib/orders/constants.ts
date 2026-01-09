import type { OrderStatus } from "./types";

export const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "on_hold", "cancelled"],
  processing: ["on_hold", "shipped", "cancelled"],
  on_hold: ["processing", "cancelled"],
  shipped: ["delivered", "refunded"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus) {
  return ALLOWED_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}
