// apps/saas/app/api/_common.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Force Node runtime for all helpers here */
export const runtime = "nodejs";

/* ================== BASIC HELPERS ================== */

export type JsonResult = ReturnType<typeof NextResponse.json>;

export function json(data: any, init?: number | ResponseInit) {
  const resInit: ResponseInit =
    typeof init === "number" ? { status: init } : (init ?? {});
  return NextResponse.json(data, resInit);
}

export function nowISO() {
  return new Date().toISOString();
}

export function normalizeStr(v?: string | null) {
  return (v ?? "").trim().toLowerCase();
}

export function makeId(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

/* ================== AUTH HELPERS ================== */

export type Role = "buyer" | "seller" | "admin" | "user";

/** Bearer extractor (works with Request or NextRequest) */
export function getBearer(req: Request | NextRequest) {
  const h = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!h) return null;
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
}

/* ================== FILE HELPERS (NODE ONLY) ================== */

export async function readJson<T = any>(relPath: string, fallback?: T): Promise<T> {
  try {
    const { readFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const abs = join(process.cwd(), relPath);
    const raw = await readFile(abs, "utf8");
    return JSON.parse(raw) as T;
  } catch (e) {
    if (fallback !== undefined) return fallback;
    throw e;
  }
}

export async function writeJson(relPath: string, data: any): Promise<void> {
  const { writeFile, mkdir } = await import("node:fs/promises");
  const { dirname, join } = await import("node:path");
  const abs = join(process.cwd(), relPath);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, JSON.stringify(data, null, 2), "utf8");
}

/* ================== ACTOR RESOLVER ================== */

/**
 * Minimal token → actor resolver (won't crash if files don't exist).
 * Expected optional files:
 *  - src/data/auth/tokens.json   [{ token, userId, role, email, stores? ... }]
 *  - src/data/users/users.json   [{ id, email, role/roles, stores? ... }]
 */
export async function findActorByToken(token: string) {
  if (!token) return null;

  const tokens = await readJson<any[]>("src/data/auth/tokens.json", []);
  const users = await readJson<any[]>("src/data/users/users.json", []);

  const t = (Array.isArray(tokens) ? tokens : []).find((x) => x?.token === token) ?? null;
  if (!t) return null;

  const u =
    (Array.isArray(users) ? users : []).find((x) => x?.id === t.userId) ||
    (Array.isArray(users) ? users : []).find(
      (x) => x?.email && t?.email && normalizeStr(x.email) === normalizeStr(t.email)
    ) ||
    null;

  // role normalization (support role string OR roles array)
  const roleFromUser =
    (typeof u?.role === "string" ? u.role : null) ??
    (Array.isArray(u?.roles) ? u.roles[0] : null);

  const role = (t.role ?? roleFromUser ?? "user") as Role;

  return {
    token: t.token,
    id: t.userId ?? u?.id ?? null, // ✅ many routes expect actor.id
    userId: t.userId ?? u?.id ?? null,
    role,
    email: t.email ?? u?.email ?? null,
    stores: Array.isArray(u?.stores) ? u.stores : Array.isArray(t?.stores) ? t.stores : [],
    user: u ?? null,
  };
}

/* ================== JSON CRUD FACTORY ================== */

type PublicPolicy = {
  publicReadable?: boolean;
  allowQuery?: boolean;
  activeOnly?: boolean;
  queryFields?: string[];
  tagsField?: string;
  requireStoreKey?: boolean;
};

type WritePolicy = {
  requireAuth?: boolean;
  roles?: Role[];
  ownerKey?: string; // e.g., "store_key", "seller_id"
  allowStatusActiveForAdminOnly?: boolean;
  writeMode?: "memory" | "file"; // kept for compat (we always use file in this impl)
};

export type JsonCrudPolicy = {
  module: string;
  idField?: string; // default: "id"
  public?: PublicPolicy;
  write?: WritePolicy;
};

function actorRole(actor: any): Role {
  return (actor?.role ?? "user") as Role;
}

function hasWriteRole(actor: any, roles?: Role[]) {
  if (!roles || roles.length === 0) return true;
  return roles.includes(actorRole(actor));
}

function pickQueryParams(req: Request | NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = normalizeStr(searchParams.get("q") || "");
  const tag = normalizeStr(searchParams.get("tag") || "");
  const storeKey = normalizeStr(searchParams.get("store_key") || "");
  const id = normalizeStr(searchParams.get("id") || "");
  return { q, tag, storeKey, id, searchParams };
}

function matchQuery(item: any, q: string, fields: string[]) {
  if (!q) return true;
  for (const f of fields) {
    const v = normalizeStr(String(item?.[f] ?? ""));
    if (v.includes(q)) return true;
  }
  return false;
}

function matchTag(item: any, tag: string, tagsField?: string) {
  if (!tag) return true;
  if (!tagsField) return true;
  const arr = item?.[tagsField];
  if (!Array.isArray(arr)) return false;
  return arr.map((x: any) => normalizeStr(String(x))).includes(tag);
}

function isActive(item: any) {
  const s = normalizeStr(item?.status);
  if (!s) return true;
  return s === "active";
}

export function makeJsonCrudRoute(jsonPath: string, policy: JsonCrudPolicy) {
  const idField = policy.idField ?? "id";

  async function requireActor(req: Request | NextRequest) {
    const token = getBearer(req);
    const actor = token ? await findActorByToken(token) : null;
    return { token, actor };
  }

  const GET = async (req: Request | NextRequest) => {
    const allowPublic = policy.public?.publicReadable === true;

    // Auth gate when not public
    if (!allowPublic) {
      const { actor } = await requireActor(req);
      if (!actor) return json({ error: "Unauthorized", module: policy.module }, 401);
    }

    const list = (await readJson<any[]>(jsonPath, [])) ?? [];
    const { q, tag, storeKey, id } = pickQueryParams(req);

    if (policy.public?.requireStoreKey === true && !storeKey) {
      return json({ error: "store_key required", module: policy.module }, 400);
    }

    let out = Array.isArray(list) ? list : [];

    if (id) out = out.filter((x) => normalizeStr(x?.[idField]) === id);

    if (policy.public?.activeOnly) out = out.filter(isActive);

    out = out.filter((x) => matchTag(x, tag, policy.public?.tagsField));

    if (policy.public?.allowQuery && q) {
      const fields =
        policy.public?.queryFields?.length ? policy.public.queryFields : [idField];
      out = out.filter((x) => matchQuery(x, q, fields));
    }

    return json({ module: policy.module, data: out }, 200);
  };

  const POST = async (req: Request | NextRequest) => {
    const { actor } = await requireActor(req);

    if (policy.write?.requireAuth && !actor) {
      return json({ error: "Unauthorized", module: policy.module }, 401);
    }
    if (!hasWriteRole(actor, policy.write?.roles)) {
      return json({ error: "Forbidden", module: policy.module }, 403);
    }

    const body = await (req as any).json().catch(() => ({}));
    const list = (await readJson<any[]>(jsonPath, [])) ?? [];

    // ownerKey enforcement (basic)
    if (policy.write?.ownerKey) {
      const k = policy.write.ownerKey;
      if (body?.[k] == null) return json({ error: `${k} required`, module: policy.module }, 400);

      if (k === "store_key" && Array.isArray(actor?.stores) && actor.stores.length) {
        const sk = normalizeStr(body?.store_key);
        if (!actor.stores.map(normalizeStr).includes(sk)) {
          return json({ error: "Forbidden (store_key)", module: policy.module }, 403);
        }
      }

      if (k === "seller_id" && actorRole(actor) === "seller") {
        if (normalizeStr(body?.seller_id) !== normalizeStr(actor?.id)) {
          return json({ error: "Forbidden (seller_id)", module: policy.module }, 403);
        }
      }
    }

    // active status admin-only
    if (policy.write?.allowStatusActiveForAdminOnly && normalizeStr(body?.status) === "active") {
      if (actorRole(actor) !== "admin") body.status = "pending";
    }

    const item = {
      [idField]: body?.[idField] ?? makeId(policy.module),
      ...body,
      _createdAt: nowISO(),
    };

    (Array.isArray(list) ? list : []).unshift(item);
    await writeJson(jsonPath, list);

    return json({ ok: true, item, module: policy.module }, 201);
  };

  const PUT = async (req: Request | NextRequest) => {
    const { actor } = await requireActor(req);

    if (policy.write?.requireAuth && !actor) {
      return json({ error: "Unauthorized", module: policy.module }, 401);
    }
    if (!hasWriteRole(actor, policy.write?.roles)) {
      return json({ error: "Forbidden", module: policy.module }, 403);
    }

    const body = await (req as any).json().catch(() => ({}));
    const id = normalizeStr(body?.[idField]);
    if (!id) return json({ error: `Missing ${idField}`, module: policy.module }, 400);

    const list = (await readJson<any[]>(jsonPath, [])) ?? [];
    const arr = Array.isArray(list) ? list : [];
    const idx = arr.findIndex((x) => normalizeStr(x?.[idField]) === id);
    if (idx < 0) return json({ error: "Not found", module: policy.module }, 404);

    // ownerKey enforcement on update (prevent ownership change)
    if (policy.write?.ownerKey) {
      const k = policy.write.ownerKey;
      const existing = arr[idx];
      const existingKey = normalizeStr(existing?.[k]);
      const incomingKey = body?.[k] != null ? normalizeStr(body?.[k]) : existingKey;

      if (incomingKey !== existingKey) {
        return json({ error: `${k} cannot be changed`, module: policy.module }, 409);
      }

      if (k === "store_key" && Array.isArray(actor?.stores) && actor.stores.length) {
        if (!actor.stores.map(normalizeStr).includes(existingKey)) {
          return json({ error: "Forbidden (store_key)", module: policy.module }, 403);
        }
      }
    }

    // active status admin-only
    if (policy.write?.allowStatusActiveForAdminOnly && normalizeStr(body?.status) === "active") {
      if (actorRole(actor) !== "admin") body.status = arr[idx]?.status ?? "pending";
    }

    arr[idx] = { ...arr[idx], ...body, _updatedAt: nowISO() };
    await writeJson(jsonPath, arr);

    return json({ ok: true, item: arr[idx], module: policy.module }, 200);
  };

  const DELETE = async (req: Request | NextRequest) => {
    const { actor } = await requireActor(req);

    if (policy.write?.requireAuth && !actor) {
      return json({ error: "Unauthorized", module: policy.module }, 401);
    }
    if (!hasWriteRole(actor, policy.write?.roles)) {
      return json({ error: "Forbidden", module: policy.module }, 403);
    }

    const { id } = pickQueryParams(req);
    if (!id) return json({ error: `Missing ${idField} in ?id=`, module: policy.module }, 400);

    const list = (await readJson<any[]>(jsonPath, [])) ?? [];
    const arr = Array.isArray(list) ? list : [];
    const next = arr.filter((x) => normalizeStr(x?.[idField]) !== id);
    if (next.length === arr.length) return json({ error: "Not found", module: policy.module }, 404);

    await writeJson(jsonPath, next);
    return json({ ok: true, module: policy.module }, 200);
  };

  return { GET, POST, PUT, DELETE };
}

/* ================== BACKWARD COMPAT ================== */

/** Backward-compat: if any route still imports makeJsonRoute */
export const makeJsonRoute = makeJsonCrudRoute;

