import { NextResponse } from "next/server";
import { readJson } from "@/src/lib/fs/readJson";
import { setSession } from "@/src/lib/auth/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "").trim();

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "email_and_password_required" }, { status: 400 });
  }

  const users = (await readJson("src/data/users/users.json", [])) as any[];
  const user = users.find((u) => String(u?.email || "").toLowerCase() === email);

  if (!user || String(user?.password || "") !== password) {
    return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });
  }

  if (user.blocked) {
    return NextResponse.json({ ok: false, error: "account_blocked" }, { status: 403 });
  }

  if (!user.email_verified) {
    return NextResponse.json({ ok: false, error: "email_not_verified" }, { status: 403 });
  }

  await setSession({
    user: {
      id: user.id,
      email: user.email,
      roles: user.roles,
      store_key: user.store_key
    },
    iat: Date.now()
  });

  user.meta = user.meta || {};
  user.meta.last_login = Date.now();
  user.meta.login_count = Number(user.meta.login_count || 0) + 1;
  // (isteğe bağlı) login meta yazmak istersen writeJson ile kaydet

  return NextResponse.json({ ok: true });
}
