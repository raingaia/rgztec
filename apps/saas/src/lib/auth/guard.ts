// apps/saas/src/lib/auth/guard.ts
import { NextResponse } from "next/server";
import { getSession } from "./session";
import type { Role } from "./roles";
import { isRole } from "./roles";

type GuardOptions = {
  requireAuth?: boolean;
  roles?: Role[];
  requireStoreKey?: boolean;
};

export type GuardOk = {
  ok: true;
  session: NonNullable<Awaited<ReturnType<typeof getSession>>>;
};

function jsonError(status: number, message: string) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function guardApi(req: Request, opts: GuardOptions = {}): Promise<GuardOk | Response> {
  const { requireAuth = false, roles = [], requireStoreKey = false } = opts;

  const session = await getSession();

  if (requireAuth) {
    if (!session?.user?.id) return jsonError(401, "Unauthorized");
    if (session.user.roles?.length) {
      // ok
    } else {
      return jsonError(401, "Unauthorized");
    }
  }

  if (roles.length) {
    const userRoles = (session?.user?.roles || []).filter(isRole);
    const allowed = roles.some((r) => userRoles.includes(r));
    if (!allowed) return jsonError(403, "Forbidden");
  }

  if (requireStoreKey) {
    const url = new URL(req.url);
    const storeKey = url.searchParams.get("store_key") || "";
    if (!storeKey) return jsonError(400, "Missing store_key");
  }

  if (!session) return jsonError(401, "Unauthorized");
  return { ok: true, session };
}


