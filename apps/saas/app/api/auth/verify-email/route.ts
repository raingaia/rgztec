export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { readJson, writeJson } from "../../_common"; // <-- route'un konumuna göre ../../_common veya ../_common olacak

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));
  const token = String(body?.token || "").trim();
  if (!token) return NextResponse.json({ ok: false, error: "token_required" }, { status: 400 });

  const usersPath = "src/data/users/users.json";
  const tokensPath = "src/data/auth/verify_tokens.json";

  const tokens = (await readJson<any[]>(tokensPath, [])) ?? [];
  const rec = tokens.find((t) => t?.token === token);

  if (!rec) return NextResponse.json({ ok: false, error: "invalid_token" }, { status: 400 });
  if (rec.used) return NextResponse.json({ ok: false, error: "token_used" }, { status: 400 });
  if (Date.now() > Number(rec.expires_at || 0))
    return NextResponse.json({ ok: false, error: "token_expired" }, { status: 400 });

  const users = (await readJson<any[]>(usersPath, [])) ?? [];
  const idx = users.findIndex((u) => u?.id === rec.user_id);
  if (idx < 0) return NextResponse.json({ ok: false, error: "user_not_found" }, { status: 404 });

  users[idx].email_verified = true;
  users[idx].meta = users[idx].meta || {};
  users[idx].meta.verified_at = Date.now();

  rec.used = true;
  rec.used_at = Date.now();

  // ✅ mutlaka await
  await writeJson(usersPath, users);
  await writeJson(tokensPath, tokens);

  return NextResponse.json({ ok: true });
}

