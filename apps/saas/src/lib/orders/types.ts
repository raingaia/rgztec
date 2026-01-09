export type Currency = "USD" | "EUR" | "TRY";

export type OrderStatus =
  | "pending"
  | "processing"
  | "on_hold"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "unpaid" | "authorized" | "paid" | "failed" | "refunded";
export type FulfillmentStatus = "unfulfilled" | "partial" | "fulfilled" | "not_required";

export type ActorRole = "system" | "admin" | "seller" | "buyer" | "stripe";

export type OrderCustomer = {
  id?: string;
  name: string;
  email: string;
};

export type Address = {
  country: string;
  city: string;
  line1: string;
  postal_code?: string;
};

export type Order = {
  id: string;
  number: string;
  created_at: string;   // ISO
  updated_at: string;   // ISO

  seller_id: string;
  store_id?: string;
  channel?: string;

  status: OrderStatus;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;

  currency: Currency;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  shipping_total: number;
  total: number;

  customer: OrderCustomer;
  shipping_address?: Address;

  meta?: { notes?: string; tags?: string[] };
};

export type OrderItemType = "digital" | "physical" | "service";

export type OrderItem = {
  id: string;
  order_id: string;

  product_id?: string;
  sku?: string;
  title: string;
  type: OrderItemType;

  quantity: number;
  unit_price: number;
  line_total: number;
  currency: Currency;

  fulfillment?: {
    status: "not_required" | "pending" | "fulfilled";
    download_url?: string;
    tracking_number?: string;
    carrier?: string;
  };
};

export type OrderEventType =
  | "order_created"
  | "payment_authorized"
  | "payment_captured"
  | "payment_failed"
  | "status_changed"
  | "fulfillment_updated"
  | "note_added";

export type OrderEvent = {
  id: string;
  order_id: string;
  at: string; // ISO

  type: OrderEventType;
  message: string;

  actor: { role: ActorRole; id: string };

  data?: Record<string, unknown>;
};
