import { cookies } from "next/headers";
import type { Role } from "./roles";
import { isRole } from "./roles";
import { hmacSHA256, base64url } from "./crypto";

const COOKIE_NAME = "rgz_session";
const SECRET = process.env.RGZ_SESSION_SECRET || "dev-secret-change-me";

export type SessionUser = {
  id: string;
  email?: string;
  roles: Role[];
};

export type Session = {
  user: SessionUser;
  iat: number;
};

function encode(session: Session) {
  const payload = JSON.stringify(session);
  const payloadB64 = base64url(Buffer.from(payload, "utf8"));
  const sig = base64url(hmacSHA256(SECRET, payloadB64));
  return `${payloadB64}.${sig}`;
}

function decode(token: string): Session | null {
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return null;

  const expected = base64url(hmacSHA256(SECRET, payloadB64));
  if (expected !== sig) return null;

  try {
    const json = Buffer.from(
      payloadB64.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    ).toString("utf8");
    const obj = JSON.parse(json);

    // minimal validation
    const roles = Array.isArray(obj?.user?.roles) ? obj.user.roles : [];
    const cleanRoles = roles.filter(isRole);

    if (!obj?.user?.id || cleanRoles.length === 0) return null;

    return {
      user: {
        id: String(obj.user.id),
        email: obj.user.email ? String(obj.user.email) : undefined,
        roles: cleanRoles,
      },
      iat: Number(obj.iat || Date.now()),
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return decode(token);
}

export async function setSession(session: Session) {
  const jar = await cookies();
  const token = encode(session);
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
