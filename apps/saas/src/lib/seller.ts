// apps/saas/src/lib/seller.ts
import { headers } from "next/headers";

/**
 * Demo: header'dan seller id alır.
 * Prod: middleware/login sonrası buraya "x-seller-id" set edilecek.
 */
export function getSellerIdFromRequest(): string {
  const h = headers();
  const sid = h.get("x-seller-id");
  if (sid && sid.trim()) return sid.trim();
  return "demo";
}

/**
 * Row bazlı sahiplik kontrolü.
 * - row.seller_id varsa eşitlik kontrolü
 * - yoksa demo modda true döner (şimdilik)
 */
export function isMine(row: any, sellerId: string): boolean {
  if (row?.seller_id != null) return String(row.seller_id) === String(sellerId);
  return true;
}
