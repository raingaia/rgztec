import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "rgz_session";

function base64urlToString(input: string) {
  input = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = input.length % 4;
  if (pad) input += "=".repeat(4 - pad);
  return Buffer.from(input, "base64").toString("utf8");
}

function readRolesFromCookie(req: NextRequest): string[] {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return [];
  // token format: base64url(payload).base64url(sig)  (biz payload'ı json tutuyoruz)
  const parts = token.split(".");
  if (parts.length < 1) return [];
  try {
    const payloadJson = base64urlToString(parts[0]);
    const payload = JSON.parse(payloadJson);
    const roles = Array.isArray(payload?.roles) ? payload.roles : [];
    return roles.map(String);
  } catch {
    return [];
  }
}

function requireRole(pathname: string): string | null {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/seller")) return "seller";
  if (pathname.startsWith("/buyer")) return "buyer";
  return null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // public / safe paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/unauthorized" ||
    pathname === "/login"
  ) {
    return NextResponse.next();
  }

  const needed = requireRole(pathname);
  if (!needed) return NextResponse.next();

  const roles = readRolesFromCookie(req);
  if (roles.includes(needed)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/unauthorized";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*", "/buyer/:path*"],
};
