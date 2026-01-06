import { NextResponse } from "next/server";
import { getSession } from "./session";
import type { Role } from "./roles";

type GuardOptions = {
  requireAuth?: boolean;
  roles?: Role[];              // bu rollerden en az biri lazım
  requireStoreKey?: boolean;   // store_key zorunlu mu
  storeKeyName?: string;       // default: "store_key"
};

function pickStoreKey(req: Request, storeKeyName = "store_key") {
  const url = new URL(req.url);

  // 1) query: ?store_key=xxx
  const q = url.searchParams.get(storeKeyName);
  if (q) return q;

  // 2) header: x-store-key: xxx
  const h = req.headers.get("x-store-key");
  if (h) return h;

  return null;
}

export async function guardApi(req: Request, opts: GuardOptions = {}) {
  const {
    requireAuth = true,
    roles,
    requireStoreKey = false,
    storeKeyName = "store_key",
  } = opts;

  const session = await getSession();

  if (requireAuth && !session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (roles && roles.length > 0) {
    const userRoles = session?.user?.roles || [];
    const ok = roles.some((r) => userRoles.includes(r));
    if (!ok) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const storeKey = pickStoreKey(req, storeKeyName);

  if (requireStoreKey && !storeKey) {
    return NextResponse.json(
      { error: `Missing ${storeKeyName}. Provide ?${storeKeyName}=... or header x-store-key.` },
      { status: 400 }
    );
  }

  return { session, storeKey };
}

