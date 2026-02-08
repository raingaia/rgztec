import { db } from "@repo/shared";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "rgz_session";

function base64UrlToString(input: string) {
  input = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = input.length % 4;
  if (pad) input += "=".repeat(4 - pad);
  return Buffer.from(input, "base64").toString("utf8");
}

function getSessionData(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const parts = token.split(".");
    // Standart JWT payload genelde 1. parçadadır (parts[1]). 
    // Eğer verin gelmezse parts[0] ile değiştirebilirsin.
    const payload = parts[1] || parts[0]; 
    const json = base64UrlToString(payload);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function requiredRole(path: string): string | null {
  if (path.startsWith("/admin")) return "admin";
  if (path.startsWith("/seller")) return "seller";
  if (path.startsWith("/buyer")) return "buyer";
  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🔓 HERKESE AÇIK YOLLAR
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/open-store") ||
    pathname.startsWith("/api/public")
  ) {
    return NextResponse.next();
  }

  const sessionData = getSessionData(req);
  const userEmail = sessionData?.email || sessionData?.sub;

  // 🛡️ ADMIN KONTROLÜ (TypeScript hatasını aşmak için 'as any' eklendi)
  if (pathname.startsWith("/admin")) {
    if (!userEmail) return NextResponse.redirect(new URL("/login", req.url));

    try {
      // 🚀 'as any' sayesinde TypeScript'in 'role' yok demesini engelliyoruz
      const user = await (db.user as any).findUnique({
        where: { email: userEmail },
        select: { id: true, role: true } 
      });

      if (!user || user.role !== "admin") {
        console.warn(`Admin yetkisi reddedildi: ${userEmail}`);
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch (error) {
      console.error("Admin DB Check Error:", error);
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 🛡️ GENEL ROL VE LİSANS KONTROLÜ
  const need = requiredRole(pathname);
  if (need) {
    const roles = Array.isArray(sessionData?.roles) ? sessionData.roles : [];
    
    if (!roles.includes(need)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (userEmail) {
      try {
        const dbUser = await db.user.findUnique({
          where: { email: userEmail },
          select: { id: true }
        });

        if (!dbUser) {
          return NextResponse.redirect(new URL("/login", req.url));
        }
      } catch (e) {
        console.error("General DB Check Error:", e);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*", "/buyer/:path*"],
};