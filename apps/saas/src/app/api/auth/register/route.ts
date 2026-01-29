// apps/saas/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import * as crypto from "node:crypto"; // Hata 1192 Fix: Default export yerine '*' as kullanıldı
import * as nodemailer from "nodemailer";
import { readJson, writeJson, json, makeId } from "@common";

export const runtime = "nodejs";

// Rastgele güvenli token üretimi
function makeToken() { 
  return crypto.randomBytes(32).toString("hex"); 
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "").trim();
  const name = String(body?.name || "").trim() || "RGZTEC User";

  if (!email || !password) {
    return json({ ok: false, error: "email_and_password_required" }, 400);
  }

  const usersPath = "@data/users/users.json";
  const tokensPath = "@data/auth/verify_tokens.json";

  // Mevcut kullanıcıları kontrol et
  const users = (await readJson<any[]>(usersPath, [])) ?? [];
  const exists = users.some((u) => String(u?.email || "").toLowerCase() === email);
  
  if (exists) {
    return json({ ok: false, error: "email_already_exists" }, 409);
  }

  // Yeni kullanıcı objesi
  const user = {
    id: makeId("u"), // _common'dan gelen güvenli ID üreteci
    email,
    password, // Not: Production aşamasında buraya bcrypt/argon2 eklenmeli
    auth_provider: "local",
    email_verified: false,
    roles: ["buyer"],
    active: true,
    blocked: false,
    store_key: null,
    profile: { name, avatar: null },
    meta: { 
      created_at: Date.now(), 
      last_login: null, 
      login_count: 0, 
      verified_at: null 
    }
  };

  users.push(user);
  await writeJson(usersPath, users);

  // Doğrulama token'ı oluştur
  const tokens = (await readJson<any[]>(tokensPath, [])) ?? [];
  const token = makeToken();
  const expiresAt = Date.now() + 1000 * 60 * 30; // 30 Dakika

  tokens.push({
    token,
    user_id: user.id,
    email,
    expires_at: expiresAt,
    used: false,
    created_at: Date.now()
  });
  await writeJson(tokensPath, tokens);

  // E-posta gönderim ayarları
  const baseUrl = process.env.RGZ_PUBLIC_BASE_URL || "http://localhost:3000";
  const link = `${baseUrl}/verify-email?token=${token}`;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.RGZ_SMTP_HOST,
      port: Number(process.env.RGZ_SMTP_PORT || 587),
      secure: false,
      auth: { 
        user: process.env.RGZ_SMTP_USER, 
        pass: process.env.RGZ_SMTP_PASS 
      }
    });

    await transporter.sendMail({
      from: process.env.RGZ_SMTP_FROM || process.env.RGZ_SMTP_USER,
      to: email,
      subject: "Verify your email • RGZTEC",
      text: `Verify your email:\n${link}\n\nThis link expires in 30 minutes.`,
      html: `<p>Verify your email:</p><p><a href="${link}">${link}</a></p><p>This link expires in 30 minutes.</p>`
    });

    return json({
      ok: true,
      message: "verification_sent",
      user: { id: user.id, email: user.email }
    }, 201);

  } catch (mailError) {
    console.error("Mail sending failed:", mailError);
    // Kullanıcı oluştu ama mail gitmediyse durumu bildiriyoruz
    return json({
      ok: true,
      message: "user_created_but_email_failed",
      user: { id: user.id, email: user.email }
    }, 201);
  }
}