// apps/saas/app/api/seller/orders/route.ts
import { NextResponse } from "next/server";
import { readArrayFile } from "@/src/lib/data";
import { getSellerIdFromRequest, isMine } from "@/src/lib/seller";

export async function GET() {
  const sellerId = getSellerIdFromRequest();

  // Sende şu an orders.json {} boş görünüyor -> patlamayacak, [] döner
  const orders = await readArrayFile<any>("data/orders/orders.json");

  const mine = orders.filter((o) => isMine(o, sellerId));

  // en yeni üstte
  mine.sort((a, b) => {
    const ta = new Date(a?.created_at || 0).getTime();
    const tb = new Date(b?.created_at || 0).getTime();
    return tb - ta;
  });

  return NextResponse.json({
    ok: true,
    seller_id: sellerId,
    count: mine.length,
    orders: mine.slice(0, 50),
  });
}
