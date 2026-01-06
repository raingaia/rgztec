import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "rgz_session";

function base64UrlToString(input: string) {
  input = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = input.length % 4;
  if (pad) input += "=".repeat(4 - pad);
  return Buffer.from(input, "base64").toString("utf8");
}

function readRoles(req: NextRequest): string[] {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return [];

  try {
    const [payload] = token.split(".");
    const json = base64UrlToString(payload);
    const data = JSON.parse(json);
    return Array.isArray(data.roles) ? data.roles : [];
  } catch {
    return [];
  }
}

function requiredRole(path: string): string | null {
  if (path.startsWith("/admin")) return "admin";
  if (path.startsWith("/seller")) return "seller";
  if (path.startsWith("/buyer")) return "buyer";
  return null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🔓 PUBLIC ROUTES (çok önemli)
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/open-store") ||
    pathname.startsWith("/api/public")
  ) {
    return NextResponse.next();
  }

  const need = requiredRole(pathname);
  if (!need) return NextResponse.next();

  const roles = readRoles(req);

  if (!roles.includes(need)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login"; // ⚠️ BU SAYFA GERÇEKTEN VAR OLMALI
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*", "/buyer/:path*"],
};

