import { NextResponse } from "next/server";
import { setSession } from "@/src/lib/auth/session";
import type { Role } from "@/src/lib/auth/roles";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const role = (body?.role || "buyer") as Role;

  // şimdilik DEMO login: role’a göre session basıyoruz
  // (sonra gerçek kullanıcı DB bağlarız)
  await setSession({
    user: { id: "demo", email: "demo@rgztec.com", roles: [role] },
    iat: Date.now(),
  });

  return NextResponse.json({ ok: true, role });
}
