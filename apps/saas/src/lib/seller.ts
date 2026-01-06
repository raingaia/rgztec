// apps/saas/src/lib/seller.ts
import { headers } from "next/headers";

export function getSellerIdFromRequest(): string {
  // 1) Header öncelikli (prod: auth middleware buraya koyacağız)
  const h = headers();
  const sid = h.get("x-seller-id");
  if (sid && sid.trim()) return sid.trim();

  // 2) fallback demo
  return "demo";
}

export function isMine(row: any, sellerId: string) {
  // row.seller_id varsa onunla filtreler
  if (row?.seller_id) return String(row.seller_id) === sellerId;
  // store_key modeli varsa (şimdilik) hepsini demo kabul edebiliriz
  // ileride row.store_key === user.store_key yapacağız
  return true;
}
