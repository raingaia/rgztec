// apps/saas/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { clearSession } from "@/src/lib/auth/session";

export async function POST() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
