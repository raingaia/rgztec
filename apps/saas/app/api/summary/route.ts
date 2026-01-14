// apps/saas/app/api/seller/summary/route.ts
import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getSellerIdFromRequest, isMine } from "@/lib/seller";

// fs kullandığımız için edge değil:
export const runtime = "nodejs";

function money(n: any) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

// apps/saas/src kökünü bulur (monorepo root'tan da çalışır)
function srcRoot() {
  const cwd = process.cwd();

  // monorepo root: /workspaces/rgztec
  const monorepoSrc = path.join(cwd, "apps", "saas", "src");
  if (fs.existsSync(monorepoSrc)) return monorepoSrc;

  // app root: /workspaces/rgztec/apps/saas
  const appSrc = path.join(cwd, "src");
  if (fs.existsSync(appSrc)) return appSrc;

  // fallback
  return monorepoSrc;
}

function readArrayFile<T = any>(relativeFromSrc: string): T[] {
  try {
    const filePath = path.join(srcRoot(), relativeFromSrc);
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, "utf-8");
    if (!raw.trim()) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET() {
  const sellerId = getSellerIdFromRequest();

  // ✅ Senin data yolu: apps/saas/src/data/...
  const orders = readArrayFile<any>("data/orders/orders.json");
  const products = readArrayFile<any>("data/products/products.json");

  const myOrders = orders.filter((o) => isMine(o, sellerId));
  const myProducts = products.filter((p) => isMine(p, sellerId));

  const totalOrders = myOrders.length;
  const totalProducts = myProducts.length;

  const gross = myOrders.reduce((s, o) => s + money(o.total || o.final_price || o.amount), 0);
  const net = myOrders.reduce((s, o) => s + money(o.net_revenue || o.net || o.payout), 0);

  // 7 günlük basit grafik
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
