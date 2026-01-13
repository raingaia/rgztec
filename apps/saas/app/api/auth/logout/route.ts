// apps/saas/app/api/auth/logout/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { clearSession } from "../../_common_auth/session";

export async function POST() {
  await clearSession();
  return NextResponse.json({ ok: true });
}
