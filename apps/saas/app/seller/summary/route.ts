// apps/saas/app/api/seller/summary/route.ts
import { NextResponse } from "next/server";
import { readArrayFile } from "../../../src/data";
import { getSellerIdFromRequest, isMine } from "../../../src/lib/seller";

function money(n: any) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

export async function GET() {
  const sellerId = getSellerIdFromRequest();

  const orders = await readArrayFile<any>("data/orders/orders.json");
  const products = await readArrayFile<any>("data/products/products.json");

  const myOrders = orders.filter((o) => isMine(o, sellerId));
  const myProducts = products.filter((p) => isMine(p, sellerId));

  const totalOrders = myOrders.length;
  const totalProducts = myProducts.length;

  // varsayılan alanlar: total, final_price, net_revenue vs. yoksa 0 sayar
  const gross = myOrders.reduce((s, o) => s + money(o.total || o.final_price || o.amount), 0);
  const net = myOrders.reduce((s, o) => s + money(o.net_revenue || o.net || o.payout), 0);

  // son 7 gün grafiği (basit)
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const buckets = Array.from({ length: 7 }, (_, i) => {
    const start = now - (6 - i) * dayMs;
    const d = new Date(start);
    const key = d.toISOString().slice(0, 10);
    return { key, gross: 0, orders: 0 };
  });

  const map = new Map(buckets.map((b) => [b.key, b]));
  for (const o of myOrders) {
    const t = new Date(o?.created_at || o?.date || 0).toISOString().slice(0, 10);
    const b = map.get(t);
    if (!b) continue;
    b.orders += 1;
    b.gross += money(o.total || o.final_price || o.amount);
  }

  return NextResponse.json({
    ok: true,
    seller_id: sellerId,
    kpi: {
      totalOrders,
      totalProducts,
      grossRevenue: gross,
      netRevenue: net,
    },
    chart7d: buckets,
  });
}
