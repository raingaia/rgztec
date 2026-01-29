// apps/saas/src/lib/seller.ts
import { headers } from "next/headers";

/**
 * ✅ async eklendi ve dönüş tipi Promise<string> oldu.
 */
export async function getSellerIdFromRequest(): Promise<string> {
  const h = await headers(); // ✅ await ekleyerek Promise'i çözdük
  const sid = h.get("x-seller-id");
  if (sid && sid.trim()) return sid.trim();
  return "demo";
}

/**
 * Bu fonksiyon sadece mantıksal kontrol yaptığı için senkron kalabilir.
 */
export function isMine(row: any, sellerId: string): boolean {
  if (row?.seller_id != null) return String(row.seller_id) === String(sellerId);
  return true;
}
