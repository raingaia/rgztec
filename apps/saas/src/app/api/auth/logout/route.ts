// apps/saas/app/api/auth/logout/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { clearSession } from "@common";   // ✅ alias kullanıldı

export async function POST() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
