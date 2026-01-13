import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { readJson, writeJson } from "../../_common";

export const runtime = "nodejs";

function now() { return Date.now(); }
function makeId() { return "u_" + crypto.randomBytes(6).toString("hex"); }
function makeToken() { return crypto.randomBytes(32).toString("hex"); }

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "").trim();
  const name = String(body?.name || "").trim() || "RGZTEC User";

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "email_and_password_required" }, { status: 400 });
  }

  const usersPath = "src/data/users/users.json";
  const tokensPath = "src/data/auth/verify_tokens.json";

  const users = (await readJson<any[]>(usersPath, [])) ?? [];
  const exists = users.some((u) => String(u?.email || "").toLowerCase() === email);
  if (exists) {
    return NextResponse.json({ ok: false, error: "email_already_exists" }, { status: 409 });
  }

  const user = {
    id: makeId(),
    email,
    password, // şimdilik plain; sonra hash
    auth_provider: "local",
    email_verified: false,
    roles: ["buyer"],
    active: true,
    blocked: false,
    store_key: null,
    profile: { name, avatar: null },
    meta: { created_at: now(), last_login: null, login_count: 0, verified_at: null }
  };

  users.push(user);
  await writeJson(usersPath, users);

  const tokens = (await readJson<any[]>(tokensPath, [])) ?? [];
  const token = makeToken();
  const expiresAt = now() + 1000 * 60 * 30;

  tokens.push({
    token,
    user_id: user.id,
    email,
    expires_at: expiresAt,
    used: false,
    created_at: now()
  });
  await writeJson(tokensPath, tokens);

  const baseUrl = process.env.RGZ_PUBLIC_BASE_URL || "http://localhost:3000";
  const link = `${baseUrl}/verify-email?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: process.env.RGZ_SMTP_HOST,
    port: Number(process.env.RGZ_SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.RGZ_SMTP_USER, pass: process.env.RGZ_SMTP_PASS }
  });

  await transporter.sendMail({
    from: process.env.RGZ_SMTP_FROM || process.env.RGZ_SMTP_USER,
    to: email,
    subject: "Verify your email • RGZTEC",
    text: `Verify your email:\n${link}\n\nThis link expires in 30 minutes.`,
    html: `<p>Verify your email:</p><p><a href="${link}">${link}</a></p><p>This link expires in 30 minutes.</p>`
  });

  return NextResponse.json({
    ok: true,
    message: "verification_sent",
    user: { id: user.id, email: user.email }
  });
}
