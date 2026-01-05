import crypto from "crypto";
import { cookies } from "next/headers";
import type { Role } from "./roles";
import { isRole } from "./roles";

const COOKIE_NAME = "rgz_session";
const DEFAULT_SECRET = "dev-secret-change-me";

export type SessionUser = {
  id: string;
  email?: string;
  roles: Role[];
};

export type Session = {
  user: SessionUser;
  iat: number;
};

function secret() {
  return process.env.SESSION_SECRET || DEFAULT_SECRET;
}

function b64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function unb64url(input: string) {
  const s = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s + pad, "base64");
}

function sign(payloadB64: string) {
  const h = crypto.createHmac("sha256", secret());
  h.update(payloadB64);
  return b64url(h.digest());
}

export function encodeSession(session: Session) {
  const payloadB64 = b64url(JSON.stringify(session));
  const sig = sign(payloadB64);
  return `${payloadB64}.${sig}`;
}

export function decodeSession(token: string): Session | null {
  try {
    const [payloadB64, sig] = token.split(".");
    if (!payloadB64 || !sig) return null;
    const expected = sign(payloadB64);
    if (sig !== expected) return null;

    const raw = unb64url(payloadB64).toString("utf-8");
    const parsed = JSON.parse(raw);

    // basic validation
    if (!parsed?.user?.id) return null;
    const roles = Array.isArray(parsed.user.roles) ? parsed.user.roles.filter(isRole) : [];
    if (!roles.length) return null;

    return {
      user: {
        id: String(parsed.user.id),
        email: parsed.user.email ? String(parsed.user.email) : undefined,
        roles,
      },
      iat: Number(parsed.iat || Date.now()),
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export async function setSession(session: Session) {
  const jar = await cookies();
  const token = encodeSession(session);

  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}
