// apps/saas/app/api/auth/login/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

import {
  readJson,
  writeJson,
  findUserByEmail,
  validateLocalPassword,
  normalizeRoles,
  setSession,
  type Role,
} from "../../_common";


export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));
  const email = String(body?.email || "").trim();
  const password = String(body?.password || "");

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "email_and_password_required" }, { status: 400 });
  }

  const user = await findUserByEmail(email);
  if (!user) return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });

  if (user.active === false) return NextResponse.json({ ok: false, error: "account_inactive" }, { status: 403 });
  if (user.blocked === true) return NextResponse.json({ ok: false, error: "account_blocked" }, { status: 403 });

  const ok = await validateLocalPassword(user, password);
  if (!ok) return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });

  const roles = normalizeRoles(user.roles) as Role[];
  const role = roles[0] ?? ("buyer" as Role);

  await setSession({
    user: { id: user.id, email: user.email, roles },
    iat: Date.now(),
  });

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      roles,
      role,
      email_verified: Boolean(user.email_verified),
      store_key: user.store_key ?? null,
      name: user.profile?.name ?? null,
    },
  });
}

