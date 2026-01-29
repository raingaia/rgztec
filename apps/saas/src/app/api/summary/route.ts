// apps/saas/src/app/api/seller/summary/route.ts

import { readJson, json, normalizeStr } from "@common"; 
import { getSellerIdFromRequest, isMine } from "@lib/seller"; 
import * as fs from "node:fs";
import * as path from "node:path";

export const runtime = "nodejs";

function money(n: any) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

export async function GET(req: Request) {
  // ✅ KRİTİK DÜZELTME: getSellerIdFromRequest() artık asenkron, await şart!
  const sellerId = await getSellerIdFromRequest();

  const orders = await readJson<any[]>("@data/orders/orders.json", []);
  const products = await readJson<any[]>("@data/products/products.json", []);

  // ✅ sellerId artık temiz bir string olduğu için filtreleme hatasız çalışacak
  const myOrders = orders.filter((o) => isMine(o, sellerId));
  const myProducts = products.filter((p) => isMine(p, sellerId));

  const totalOrders = myOrders.length;
  const totalProducts = myProducts.length;

  const gross = myOrders.reduce((s, o) => s + money(o.total || o.final_price || o.amount), 0);
  const net = myOrders.reduce((s, o) => s + money(o.net_revenue || o.net || o.payout), 0);

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
    const dt = new Date(o?.created_at || o?.date || 0);
    if (Number.isNaN(dt.getTime())) continue;
    const key = dt.toISOString().slice(0, 10);
    const b = map.get(key);
    if (!b) continue;
    b.orders += 1;
    b.gross += money(o.total || o.final_price || o.amount);
  }

  return json({
    ok: true,
    seller_id: sellerId,
    kpi: {
      totalOrders,
      totalProducts,
      grossRevenue: gross,
      netRevenue: net,
    },
    chart7d: buckets,
  }, 200);
}