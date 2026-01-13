// apps/saas/app/api/seller/orders/route.ts
import { NextResponse } from "next/server";

// Eğer sende helper farklıysa burayı ona göre değiştiririz.
// Şimdilik en sağlamı: direkt fs ile oku (cwd şaşsa bile apps/saas baz alıyoruz)
import fs from "fs";
import path from "path";

import { getSellerIdFromRequest, isMine } from "@/lib/seller";

function appRoot() {
  const cwd = process.cwd();

  // Next bazen monorepo root'ta çalışır: /workspaces/rgztec
  // bazen app root'ta: /workspaces/rgztec/apps/saas
  const monorepoApp = path.join(cwd, "apps", "saas");
  if (fs.existsSync(path.join(monorepoApp, "app"))) return monorepoApp;

  if (fs.existsSync(path.join(cwd, "app"))) return cwd;

  return cwd;
}

async function readArrayFile<T = any>(relativePathFromApp: string): Promise<T[]> {
  const base = appRoot();
  const filePath = path.join(base, relativePathFromApp);

  try {
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

  // apps/saas/data/orders/orders.json bekliyoruz
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
