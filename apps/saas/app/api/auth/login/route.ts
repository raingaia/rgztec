import { NextResponse } from "next/server";
import { setSession } from "@/src/lib/auth/session";
import type { Role } from "@/src/lib/auth/roles";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // TEMP: role'ü body'den alıyoruz: { role: "buyer" | "seller" | "admin" }
  const role = (body?.role || "buyer") as Role;

  await setSession({
    user: { id: "dev-user-1", email: "dev@rgztec.com", roles: [role] },
    iat: Date.now(),
  });

  return NextResponse.json({ ok: true, role });
}
