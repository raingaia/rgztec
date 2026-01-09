import { JsonOrderRepository } from "./repository/order.repo.json";
import { OrderService } from "./service/order.service";

export function createOrderService() {
  const repo = new JsonOrderRepository();
  return new OrderService(repo);
}
